const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType } = require('@discordjs/voice');
const play = require('play-dl');
const youtubedl = require('youtube-dl-exec');
const ytSearch = require('yt-search');
const { spawn } = require('child_process');
const { getUncachableSpotifyClient } = require('../../utils/spotify');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Odtwórz muzykę z YouTube lub dodaj playlistę')
    .addStringOption(option =>
      option.setName('utwor')
        .setDescription('Link do YouTube/Spotify lub nazwa utworu')
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
        return interaction.reply('❌ Podaj link do YouTube/Spotify lub nazwę utworu!');
      }
      query = args.join(' ');
    }

    try {
      if (isSlash) {
        await interaction.reply('🔍 Szukam utworu...');
      } else {
        await channel.send('🔍 Szukam utworu...');
      }

      let songs = [];
      
      const validationType = play.yt_validate(query);
      console.log('[PLAY] Query:', query, 'Type:', validationType);
      
      if (query.includes('spotify.com')) {
        const spotifyUrlMatch = query.match(/playlist\/([a-zA-Z0-9]+)/);
        const spotifyTrackMatch = query.match(/track\/([a-zA-Z0-9]+)/);
        
        if (spotifyUrlMatch) {
          const playlistId = spotifyUrlMatch[1];
          console.log('[PLAY] Spotify playlist detected:', playlistId);
          
          const updateMsg = '📥 Pobieram playlistę Spotify...';
          if (isSlash) {
            await interaction.editReply(updateMsg);
          } else {
            await channel.send(updateMsg);
          }
          
          try {
            console.log('[PLAY] Getting Spotify playlist data via SDK...');
            const spotify = await getUncachableSpotifyClient();
            const playlistData = await spotify.playlists.getPlaylist(playlistId);
            
            if (!playlistData || !playlistData.tracks || !playlistData.tracks.items) {
              throw new Error('Nie można pobrać danych playlisty');
            }
            
            console.log('[PLAY] Spotify playlist:', playlistData.name, 'Tracks:', playlistData.tracks.items.length);
            
            let tracksToFetch = playlistData.tracks.items;
            let nextUrl = playlistData.tracks.next;
            
            while (nextUrl) {
              const offset = tracksToFetch.length;
              const nextBatch = await spotify.playlists.getPlaylistItems(playlistId, { limit: 50, offset });
              if (nextBatch && nextBatch.items && nextBatch.items.length > 0) {
                tracksToFetch = tracksToFetch.concat(nextBatch.items);
                nextUrl = nextBatch.next;
              } else {
                break;
              }
            }
            
            console.log('[PLAY] Total tracks after pagination:', tracksToFetch.length);
            
            for (const item of tracksToFetch) {
              if (item.track && item.track.name && item.track.artists && item.track.artists[0]) {
                const trackName = item.track.name;
                const artistName = item.track.artists[0].name;
                const searchQuery = `${artistName} - ${trackName}`;
                
                console.log('[PLAY] Searching YouTube for:', searchQuery);
                const searchResult = await play.search(searchQuery, { limit: 1 });
                
                if (searchResult && searchResult.length > 0) {
                  const video = searchResult[0];
                  songs.push({
                    title: video.title,
                    url: video.url,
                    channel: { name: video.channel.name },
                    durationRaw: video.durationRaw,
                    thumbnails: video.thumbnails
                  });
                } else {
                  console.log('[PLAY] Track not found on YouTube:', searchQuery);
                }
              }
            }
            
            if (songs.length === 0) {
              const message = '❌ Nie znaleziono utworów w playliście Spotify!';
              if (isSlash) {
                return await interaction.editReply(message);
              } else {
                return channel.send(message);
              }
            }
            
            const message = `✅ Dodano ${songs.length} utworów z playlisty Spotify: **${playlistData.name}**`;
            if (isSlash) {
              await interaction.editReply(message);
            } else {
              await channel.send(message);
            }
          } catch (error) {
            console.error('[PLAY] Spotify error:', error);
            const message = '❌ Błąd podczas pobierania playlisty Spotify! Spróbuj innego linku.';
            if (isSlash) {
              return await interaction.editReply(message);
            } else {
              return channel.send(message);
            }
          }
        } else if (spotifyTrackMatch) {
          const trackId = spotifyTrackMatch[1];
          console.log('[PLAY] Spotify track detected:', trackId);
          
          try {
            const spotify = await getUncachableSpotifyClient();
            const trackInfo = await spotify.tracks.get(trackId);
            
            if (!trackInfo || !trackInfo.name || !trackInfo.artists || !trackInfo.artists[0]) {
              throw new Error('Nie można pobrać danych utworu');
            }
            
            const trackName = trackInfo.name;
            const artistName = trackInfo.artists[0].name;
            const searchQuery = `${artistName} - ${trackName}`;
            
            console.log('[PLAY] Searching YouTube for:', searchQuery);
            const searchResult = await play.search(searchQuery, { limit: 1 });
            
            if (!searchResult || searchResult.length === 0) {
              const message = '❌ Nie znaleziono utworu na YouTube!';
              if (isSlash) {
                return await interaction.editReply(message);
              } else {
                return channel.send(message);
              }
            }
            
            const video = searchResult[0];
            songs.push({
              title: video.title,
              url: video.url,
              channel: { name: video.channel.name },
              durationRaw: video.durationRaw,
              thumbnails: video.thumbnails
            });
          } catch (error) {
            console.error('[PLAY] Spotify error:', error);
            const message = '❌ Błąd podczas pobierania utworu ze Spotify!';
            if (isSlash) {
              return await interaction.editReply(message);
            } else {
              return channel.send(message);
            }
          }
        }
      } else if (validationType === 'playlist') {
        console.log('[PLAY] YouTube playlist detected');
        
        const updateMsg = '📥 Pobieram playlistę YouTube...';
        if (isSlash) {
          await interaction.editReply(updateMsg);
        } else {
          await channel.send(updateMsg);
        }
        
        try {
          const playlistData = await play.playlist_info(query);
          const videos = await playlistData.all_videos();
          
          console.log('[PLAY] YouTube playlist:', playlistData.title, 'Videos:', videos.length);
          
          for (const video of videos) {
            songs.push({
              title: video.title,
              url: video.url,
              channel: { name: video.channel.name },
              durationRaw: video.durationRaw,
              thumbnails: video.thumbnails
            });
          }
          
          if (songs.length === 0) {
            const message = '❌ Playlista jest pusta!';
            if (isSlash) {
              return await interaction.editReply(message);
            } else {
              return channel.send(message);
            }
          }
          
          const message = `✅ Dodano ${songs.length} utworów z playlisty YouTube: **${playlistData.title}**`;
          if (isSlash) {
            await interaction.editReply(message);
          } else {
            await channel.send(message);
          }
        } catch (error) {
          console.error('[PLAY] Playlist error:', error);
          const message = '❌ Nie można pobrać playlisty YouTube!';
          if (isSlash) {
            return await interaction.editReply(message);
          } else {
            return channel.send(message);
          }
        }
      } else if (validationType === 'video') {
        console.log('[PLAY] Direct video URL:', query);
        const videoInfo = await play.video_info(query);
        const video = videoInfo.video_details;
        
        songs.push({
          title: video.title,
          url: video.url,
          channel: { name: video.channel.name },
          durationRaw: video.durationRaw,
          thumbnails: video.thumbnails
        });
      } else {
        console.log('[PLAY] Searching for:', query);
        const searchResult = await play.search(query, { limit: 1 });
        console.log('[PLAY] Search result:', searchResult);
        
        if (!searchResult || searchResult.length === 0) {
          const message = '❌ Nie znaleziono utworu!';
          if (isSlash) {
            return await interaction.editReply(message);
          } else {
            return channel.send(message);
          }
        }
        
        const video = searchResult[0];
        songs.push({
          title: video.title,
          url: video.url,
          channel: { name: video.channel.name },
          durationRaw: video.durationRaw,
          thumbnails: video.thumbnails
        });
      }

      if (songs.length === 0) {
        const message = '❌ Nie znaleziono żadnych utworów!';
        if (isSlash) {
          return await interaction.editReply(message);
        } else {
          return channel.send(message);
        }
      }

      if (!client.musicQueue) client.musicQueue = new Map();
      
      if (client.musicQueue.has(guild.id)) {
        const queue = client.musicQueue.get(guild.id);
        const wasEmpty = queue.queue.length === 0;
        queue.queue.push(...songs);
        
        if (wasEmpty && queue.player.state.status === AudioPlayerStatus.Idle) {
          console.log('[PLAY] Queue was empty and player idle, starting playback');
          await playNextSong(guild.id, client, isSlash, interaction, channel);
        } else {
          const message = `✅ Dodano ${songs.length} utwor${songs.length === 1 ? '' : 'ów'} do kolejki! (Pozycja: ${queue.queue.length - songs.length + 1})`;
          if (isSlash) {
            await interaction.followUp(message);
          } else {
            channel.send(message);
          }
        }
        return;
      }

      const firstSong = songs[0];
      console.log('[PLAY] Playing first song:', firstSong.title);

      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      
      client.musicQueue.set(guild.id, { 
        connection, 
        player, 
        queue: songs,
        channel: channel,
        ffmpeg: null
      });

      await playNextSong(guild.id, client, isSlash, interaction, channel);

      player.on(AudioPlayerStatus.Idle, async () => {
        const queue = client.musicQueue.get(guild.id);
        if (!queue) return;
        
        queue.queue.shift();
        
        if (queue.queue.length > 0) {
          console.log('[PLAY] Playing next song in queue');
          await playNextSong(guild.id, client, false, null, queue.channel);
        } else {
          console.log('[PLAY] Queue empty, waiting for more songs');
          if (queue.ffmpeg) queue.ffmpeg.kill();
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

async function playNextSong(guildId, client, isSlash, interaction, channel) {
  const queue = client.musicQueue.get(guildId);
  if (!queue || queue.queue.length === 0) return;
  
  const song = queue.queue[0];
  
  try {
    console.log('[PLAY] Getting info for:', song.url);
    
    const ytInfo = await youtubedl(song.url, {
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
    
    const videoData = {
      title: ytInfo.title || song.title,
      url: song.url,
      channel: { name: ytInfo.uploader || ytInfo.channel || song.channel.name },
      durationRaw: ytInfo.duration ? new Date(ytInfo.duration * 1000).toISOString().substring(11, 19) : song.durationRaw,
      thumbnails: ytInfo.thumbnail ? [{ url: ytInfo.thumbnail }] : song.thumbnails
    };
    
    console.log('[PLAY] Creating audio stream with ffmpeg...');
    
    if (queue.ffmpeg) {
      queue.ffmpeg.kill();
    }
    
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
    
    const stream = ffmpeg.stdout;
    queue.ffmpeg = ffmpeg;
    
    console.log('[PLAY] Audio stream created successfully');
    
    const resource = createAudioResource(stream, {
      inputType: StreamType.Raw,
      inlineVolume: true
    });

    queue.player.play(resource);
    queue.connection.subscribe(queue.player);
    
    queue.queue[0] = videoData;

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🎵 Teraz gra')
      .setDescription(`[${videoData.title}](${videoData.url})`)
      .addFields(
        { name: '👤 Kanał', value: videoData.channel.name, inline: true },
        { name: '⏱️ Czas', value: videoData.durationRaw, inline: true },
        { name: '📋 W kolejce', value: `${queue.queue.length - 1} utwor${queue.queue.length - 1 === 1 ? '' : 'ów'}`, inline: true }
      )
      .setThumbnail(videoData.thumbnails[0].url)
      .setTimestamp();

    if (isSlash && interaction) {
      await interaction.followUp({ embeds: [embed] });
    } else if (channel) {
      channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[PLAY] Error playing song:', error);
    
    queue.queue.shift();
    
    if (queue.queue.length > 0) {
      await playNextSong(guildId, client, false, null, queue.channel);
    } else {
      console.log('[PLAY] Queue empty after error, waiting for more songs');
      if (queue.ffmpeg) queue.ffmpeg.kill();
    }
  }
}
