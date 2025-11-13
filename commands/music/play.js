const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType } = require('@discordjs/voice');
const play = require('play-dl');
const youtubedl = require('youtube-dl-exec');
const ytSearch = require('yt-search');
const { spawn } = require('child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Odtwórz muzykę z YouTube')
    .addStringOption(option =>
      option.setName('utwor')
        .setDescription('Link do YouTube lub nazwa utworu')
        .setRequired(true)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const guild = isSlash ? interaction.guild : interaction.guild;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    if (!member.voice.channel) {
      const message = '❌ Musisz być na kanale głosowym!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    let query;
    if (isSlash) {
      query = interaction.options.getString('utwor');
    } else {
      if (!args[0]) {
        return interaction.reply('❌ Podaj link do YouTube lub nazwę utworu!');
      }
      query = args.join(' ');
    }

    try {
      if (isSlash) {
        await interaction.reply('🔍 Szukam utworu...');
      } else {
        await channel.send('🔍 Szukam utworu...');
      }

      let videoUrl;
      let videoInfo;
      
      const validationType = play.yt_validate(query);
      console.log('[PLAY] Query:', query, 'Type:', validationType);
      
      if (validationType === 'video') {
        videoUrl = query;
        console.log('[PLAY] Direct video URL:', videoUrl);
      } else if (validationType === 'playlist') {
        const message = '❌ Playlisty nie są obsługiwane. Podaj link do pojedynczego utworu.';
        if (isSlash) {
          return await interaction.followUp(message);
        } else {
          return channel.send(message);
        }
      } else {
        console.log('[PLAY] Searching for:', query);
        const searchResult = await play.search(query, { limit: 1 });
        console.log('[PLAY] Search result:', searchResult);
        
        if (!searchResult || searchResult.length === 0) {
          const message = '❌ Nie znaleziono utworu!';
          if (isSlash) {
            return await interaction.followUp(message);
          } else {
            return channel.send(message);
          }
        }
        
        const firstResult = searchResult[0];
        console.log('[PLAY] First result:', firstResult);
        videoUrl = firstResult.url;
        console.log('[PLAY] Video URL from search:', videoUrl);
      }

      if (!videoUrl) {
        console.error('[PLAY] ERROR: videoUrl is undefined!');
        throw new Error('Nie można uzyskać URL filmu');
      }

      console.log('[PLAY] Getting info for URL:', videoUrl);
      
      let videoData;
      let stream;
      
      try {
        const ytInfo = await youtubedl(videoUrl, {
          dumpSingleJson: true,
          noCheckCertificates: true,
          noWarnings: true,
          preferFreeFormats: true,
          format: 'bestaudio'
        });
        
        console.log('[PLAY] Got video info:', ytInfo.title);
        
        if (!ytInfo.url) {
          throw new Error('Nie można pobrać URL streamu audio');
        }
        
        const audioUrl = ytInfo.url;
        console.log('[PLAY] Audio URL obtained');
        
        videoData = {
          title: ytInfo.title || 'Nieznany',
          url: videoUrl,
          channel: { name: ytInfo.uploader || ytInfo.channel || 'Nieznany' },
          durationRaw: ytInfo.duration ? new Date(ytInfo.duration * 1000).toISOString().substring(11, 19) : 'N/A',
          thumbnails: ytInfo.thumbnail ? [{ url: ytInfo.thumbnail }] : [{ url: 'https://via.placeholder.com/120' }]
        };
        
        console.log('[PLAY] Creating audio stream with ffmpeg...');
        
        const ffmpeg = spawn('ffmpeg', [
          '-reconnect', '1',
          '-reconnect_streamed', '1',
          '-reconnect_delay_max', '5',
          '-i', audioUrl,
          '-analyzeduration', '0',
          '-loglevel', '0',
          '-f', 's16le',
          '-ar', '48000',
          '-ac', '2',
          'pipe:1'
        ], {
          stdio: ['ignore', 'pipe', 'ignore']
        });
        
        ffmpeg.on('error', (err) => {
          console.error('[PLAY] FFmpeg error:', err);
        });
        
        stream = ffmpeg.stdout;
        
        console.log('[PLAY] Audio stream created successfully');
      } catch (error) {
        console.error('[PLAY] Error:', error.message);
        throw new Error(`Nie można odtworzyć: ${error.message}`);
      }

      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(stream, {
        inputType: StreamType.Raw,
        inlineVolume: true
      });

      player.play(resource);
      connection.subscribe(player);

      if (!client.musicQueue) client.musicQueue = new Map();
      client.musicQueue.set(guild.id, { connection, player, queue: [videoData], ffmpeg });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎵 Teraz gra')
        .setDescription(`[${videoData.title}](${videoData.url})`)
        .addFields(
          { name: '👤 Kanał', value: videoData.channel.name, inline: true },
          { name: '⏱️ Czas', value: videoData.durationRaw, inline: true }
        )
        .setThumbnail(videoData.thumbnails[0].url)
        .setTimestamp();

      if (isSlash) {
        await interaction.followUp({ embeds: [embed] });
      } else {
        channel.send({ embeds: [embed] });
      }

      player.on(AudioPlayerStatus.Idle, () => {
        const queue = client.musicQueue.get(guild.id);
        if (queue) {
          if (queue.ffmpeg) queue.ffmpeg.kill();
          queue.connection.destroy();
          client.musicQueue.delete(guild.id);
        }
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        const queue = client.musicQueue.get(guild.id);
        if (queue && queue.ffmpeg) queue.ffmpeg.kill();
        client.musicQueue.delete(guild.id);
      });

    } catch (error) {
      console.error(error);
      
      let errorMessage;
      if (error.message && error.message.includes('Sign in to confirm your age')) {
        errorMessage = '❌ Ten film ma ograniczenie wieku! YouTube wymaga zalogowania dla takich filmów.\n💡 Spróbuj innego utworu bez ograniczenia wieku.';
      } else if (error.message && error.message.includes('Video unavailable')) {
        errorMessage = '❌ Film niedostępny! Może być zablokowany w Twoim regionie lub usunięty.';
      } else {
        errorMessage = '❌ Wystąpił błąd podczas odtwarzania muzyki! Spróbuj innego utworu.';
      }
      
      if (isSlash) {
        await interaction.followUp(errorMessage);
      } else {
        channel.send(errorMessage);
      }
    }
  },
};
