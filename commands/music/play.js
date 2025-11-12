const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');

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
      let videoData;
      
      const validationType = play.yt_validate(query);
      console.log('DEBUG /play - query:', query, 'validationType:', validationType);
      
      if (validationType === 'video') {
        videoUrl = query;
        const info = await play.video_info(query);
        videoData = {
          title: info.video_details.title,
          url: query,
          channel: { name: info.video_details.channel.name },
          durationRaw: info.video_details.durationRaw,
          thumbnails: info.video_details.thumbnails
        };
      } else {
        const searchResult = await play.search(query, { limit: 1 });
        console.log('DEBUG /play - searchResult:', searchResult ? searchResult.length : 'null', searchResult?.[0]);
        
        if (!searchResult || searchResult.length === 0) {
          const message = '❌ Nie znaleziono utworu!';
          if (isSlash) {
            return await interaction.followUp(message);
          } else {
            return channel.send(message);
          }
        }
        
        const firstResult = searchResult[0];
        videoUrl = firstResult.url;
        videoData = firstResult;
        
        console.log('DEBUG /play - videoUrl:', videoUrl, 'title:', firstResult.title);
      }

      if (!videoUrl) {
        console.error('DEBUG /play - videoUrl is undefined!');
        throw new Error('Nie można uzyskać URL filmu');
      }

      console.log('DEBUG /play - Calling play.stream with URL:', videoUrl);
      const stream = await play.stream(videoUrl);

      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(stream.stream, { inputType: stream.type });

      player.play(resource);
      connection.subscribe(player);

      if (!client.musicQueue) client.musicQueue = new Map();
      client.musicQueue.set(guild.id, { connection, player, queue: [videoData] });

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
          queue.connection.destroy();
          client.musicQueue.delete(guild.id);
        }
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
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
