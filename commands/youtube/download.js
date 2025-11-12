const play = require('play-dl');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { Spotify } = require('spotifydl-core');
const spotify = new Spotify();
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
      let title, filePath, fileName;

      if (!fs.existsSync(path.join(__dirname, '../../downloads'))) {
        fs.mkdirSync(path.join(__dirname, '../../downloads'), { recursive: true });
      }

      if (isSpotify) {
        const spotifyData = await spotify.getTrack(url);
        title = `${spotifyData.artists[0].name} - ${spotifyData.name}`.replace(/[^\w\s-]/gi, '').substring(0, 50);
        fileName = `${title}.mp3`;
        filePath = path.join(__dirname, '../../downloads', fileName);

        const downloadingMsg = `📥 Pobieranie: **${spotifyData.name}** - ${spotifyData.artists[0].name}...`;
        if (isSlash) {
          await interaction.editReply(downloadingMsg);
        } else {
          await statusMsg.edit(downloadingMsg);
        }

        const buffer = await spotify.downloadTrack(url);
        fs.writeFileSync(filePath, buffer);

      } else {
        const info = await play.video_info(url);
        const video = info.video_details;
        title = video.title.replace(/[^\w\s]/gi, '').substring(0, 50);
        fileName = `${title}.mp3`;
        filePath = path.join(__dirname, '../../downloads', fileName);

        const downloadingMsg = `📥 Pobieranie: **${video.title}**...`;
        if (isSlash) {
          await interaction.editReply(downloadingMsg);
        } else {
          await statusMsg.edit(downloadingMsg);
        }

        const searchQuery = `${video.title} ${video.channel.name}`;
        const buffer = await spotify.downloadTrack(searchQuery);
        fs.writeFileSync(filePath, buffer);
      }

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

      fs.unlinkSync(filePath);

      const successMsg = `✅ **Gotowe!**\n\n📁 Plik: **${video.title}**\n🔗 Link: ${driveFile.data.webViewLink}\n💾 Zapisano na Google Drive!`;
      if (isSlash) {
        await interaction.editReply(successMsg);
      } else {
        await statusMsg.edit(successMsg);
      }

    } catch (error) {
      console.error('Download error:', error);
      
      let errorMsg = '❌ Wystąpił błąd podczas pobierania!';
      if (error.message && error.message.includes('Sign in to confirm your age')) {
        errorMsg = '❌ Ten film ma ograniczenie wieku! YouTube wymaga zalogowania.\n💡 Spróbuj innego filmu bez ograniczenia wieku.';
      } else if (error.message && error.message.includes('unavailable')) {
        errorMsg = '❌ Film niedostępny! Może być zablokowany lub usunięty.';
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
