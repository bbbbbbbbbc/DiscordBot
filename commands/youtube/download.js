const play = require('play-dl');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { getUncachableGoogleDriveClient } = require('../../utils/googleDrive');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Pobierz film/muzykę z YouTube/Spotify i prześlij na Google Drive')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Link do YouTube lub Spotify')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('format')
        .setDescription('Format do pobrania')
        .setRequired(false)
        .addChoices(
          { name: 'Wideo', value: 'video' },
          { name: 'Audio', value: 'audio' }
        )
    )
    .addStringOption(option =>
      option.setName('jakość')
        .setDescription('Jakość wideo (tylko YouTube)')
        .setRequired(false)
        .addChoices(
          { name: '360p (Niska)', value: '360' },
          { name: '480p (Średnia)', value: '480' },
          { name: '720p (HD)', value: '720' },
          { name: '1080p (Full HD)', value: '1080' },
          { name: 'Najlepsza dostępna', value: 'best' }
        )
    ),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    let url, format, quality;
    if (isSlash) {
      url = interaction.options?.getString('url');
      format = interaction.options?.getString('format') || 'video';
      quality = interaction.options?.getString('jakość') || 'best';
    } else {
      url = args[0];
      format = args[1] === 'audio' ? 'audio' : 'video';
      quality = 'best';
    }
    
    if (!url) {
      const message = '❌ Musisz podać URL! Użyj: `/download url:[link do YouTube lub Spotify]`';
      if (isSlash) {
        return await interaction.reply({ content: message, ephemeral: true });
      } else {
        return interaction.reply(message);
      }
    }
    
    const isSpotify = url.includes('spotify.com');
    const isYouTube = play.yt_validate(url) === 'video';
    
    if (!isSpotify && !isYouTube) {
      const message = '❌ To nie jest prawidłowy link do YouTube ani Spotify!';
      if (isSlash) {
        return await interaction.reply({ content: message, ephemeral: true });
      } else {
        return interaction.reply(message);
      }
    }

    let statusMsg;
    if (isSlash) {
      await interaction.reply('⏳ Rozpoczynam pobieranie...');
      statusMsg = await interaction.fetchReply();
    } else {
      statusMsg = await interaction.reply('⏳ Rozpoczynam pobieranie...');
    }

    try {
      let title, filePath, fileName, youtubeUrl;

      if (!fs.existsSync(path.join(__dirname, '../../downloads'))) {
        fs.mkdirSync(path.join(__dirname, '../../downloads'), { recursive: true });
      }

      if (isSpotify) {
        // Get Spotify track metadata
        const spotifyData = await play.spotify(url);
        
        if (!spotifyData || !spotifyData.name) {
          throw new Error('Nie udało się pobrać informacji o utworze Spotify');
        }

        const artist = spotifyData.artists?.[0]?.name || 'Unknown Artist';
        const trackName = spotifyData.name;
        
        const searchingMsg = `🔍 Wyszukiwanie: **${trackName}** - ${artist}...`;
        if (isSlash) {
          await interaction.editReply(searchingMsg);
        } else {
          await statusMsg.edit(searchingMsg);
        }

        // Search for the track on YouTube
        const searchResults = await play.search(`${artist} ${trackName}`, { limit: 1 });
        
        if (!searchResults || searchResults.length === 0) {
          throw new Error('Nie znaleziono utworu na YouTube');
        }

        youtubeUrl = searchResults[0].url;
        title = `${artist} - ${trackName}`.replace(/[^\w\s-]/gi, '').substring(0, 50);
        
      } else {
        // YouTube URL
        youtubeUrl = url;
        const info = await ytdl.getInfo(url);
        title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').substring(0, 50);
      }

      // Set file extension based on format
      const fileExt = format === 'audio' ? 'mp3' : 'mp4';
      fileName = `${title}.${fileExt}`;
      filePath = path.join(__dirname, '../../downloads', fileName);

      const downloadingMsg = `📥 Pobieranie: **${title}**...`;
      if (isSlash) {
        await interaction.editReply(downloadingMsg);
      } else {
        await statusMsg.edit(downloadingMsg);
      }

      // Download from YouTube using ytdl-core
      await new Promise((resolve, reject) => {
        let ytdlOptions;
        
        if (format === 'audio') {
          // Audio only
          ytdlOptions = {
            quality: 'highestaudio',
            filter: 'audioonly'
          };
        } else {
          // Video with audio
          if (quality === 'best') {
            ytdlOptions = {
              quality: 'highest',
              filter: 'audioandvideo'
            };
          } else {
            // Try to get specific quality
            const qualityHeight = quality + 'p';
            ytdlOptions = {
              quality: qualityHeight,
              filter: 'audioandvideo'
            };
          }
        }

        const stream = ytdl(youtubeUrl, ytdlOptions);
        const writeStream = fs.createWriteStream(filePath);
        
        stream.pipe(writeStream);
        
        stream.on('error', (err) => {
          // If specific quality fails, try with highest available
          if (format === 'video' && quality !== 'best') {
            console.log(`Quality ${quality}p not available, trying highest...`);
            const fallbackStream = ytdl(youtubeUrl, {
              quality: 'highest',
              filter: 'audioandvideo'
            });
            fallbackStream.pipe(fs.createWriteStream(filePath));
            fallbackStream.on('error', reject);
            fallbackStream.on('end', resolve);
          } else {
            reject(err);
          }
        });
        
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
      });

      const uploadingMsg = '☁️ Przesyłam na Google Drive...';
      if (isSlash) {
        await interaction.editReply(uploadingMsg);
      } else {
        await statusMsg.edit(uploadingMsg);
      }

      const drive = await getUncachableGoogleDriveClient();
      
      const fileMetadata = {
        name: fileName,
        mimeType: format === 'audio' ? 'audio/mpeg' : 'video/mp4'
      };

      const media = {
        mimeType: format === 'audio' ? 'audio/mpeg' : 'video/mp4',
        body: fs.createReadStream(filePath)
      };

      const driveFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink'
      });

      // Clean up downloaded file
      fs.unlinkSync(filePath);

      const successMsg = `✅ **Gotowe!**\n\n📁 Plik: **${title}**\n🔗 Link: ${driveFile.data.webViewLink}\n💾 Zapisano na Google Drive!`;
      if (isSlash) {
        await interaction.editReply(successMsg);
      } else {
        await statusMsg.edit(successMsg);
      }

    } catch (error) {
      console.error('Download error:', error);
      
      let errorMsg = '❌ Wystąpił błąd podczas pobierania!';
      
      if (error.message) {
        if (error.message.includes('Sign in to confirm your age')) {
          errorMsg = '❌ Ten film ma ograniczenie wieku! YouTube wymaga zalogowania.\n💡 Spróbuj innego filmu bez ograniczenia wieku.';
        } else if (error.message.includes('unavailable')) {
          errorMsg = '❌ Film niedostępny! Może być zablokowany lub usunięty.';
        } else if (error.message.includes('No video id found')) {
          errorMsg = '❌ Nieprawidłowy link YouTube!';
        } else if (error.message.includes('Spotify')) {
          errorMsg = `❌ Błąd Spotify: ${error.message}`;
        } else if (error.message.includes('YouTube')) {
          errorMsg = `❌ Błąd YouTube: ${error.message}`;
        } else {
          errorMsg = `❌ Błąd: ${error.message}`;
        }
      }
      
      // Clean up file if it exists
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error('Failed to clean up file:', cleanupError);
        }
      }
      
      if (isSlash) {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply(errorMsg);
        } else {
          await interaction.reply(errorMsg);
        }
      } else {
        if (statusMsg) {
          await statusMsg.edit(errorMsg);
        } else {
          await interaction.reply(errorMsg);
        }
      }
    }
  },
};
