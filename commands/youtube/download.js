const play = require('play-dl');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { getUncachableGoogleDriveClient } = require('../../utils/googleDrive');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Pobierz film/muzykę z YouTube i prześlij na Google Drive')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Link do YouTube')
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
    ),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    let url, format;
    if (isSlash) {
      url = interaction.options?.getString('url');
      format = interaction.options?.getString('format') || 'video';
    } else {
      url = args[0];
      format = args[1] === 'audio' ? 'audio' : 'video';
    }
    
    if (!url) {
      const message = '❌ Musisz podać URL! Użyj: `/download url:[link do YouTube]`';
      if (isSlash) {
        return await interaction.reply({ content: message, ephemeral: true });
      } else {
        return interaction.reply(message);
      }
    }
    
    if (play.yt_validate(url) !== 'video') {
      const message = '❌ To nie jest prawidłowy link do YouTube!';
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
      const info = await play.video_info(url);
      const video = info.video_details;
      const title = video.title.replace(/[^\w\s]/gi, '').substring(0, 50);
      
      const fileName = `${title}.${format === 'audio' ? 'mp3' : 'mp4'}`;
      const filePath = path.join(__dirname, '../../downloads', fileName);

      if (!fs.existsSync(path.join(__dirname, '../../downloads'))) {
        fs.mkdirSync(path.join(__dirname, '../../downloads'), { recursive: true });
      }

      const downloadingMsg = `📥 Pobieranie: **${video.title}**...`;
      if (isSlash) {
        await interaction.editReply(downloadingMsg);
      } else {
        await statusMsg.edit(downloadingMsg);
      }

      let selectedFormat;
      if (format === 'audio') {
        selectedFormat = info.format.find(f => 
          f.mimeType && 
          f.mimeType.includes('audio/mp4') && 
          !f.hasOwnProperty('s') &&
          f.url
        );
        if (!selectedFormat) {
          selectedFormat = info.format.find(f => f.mimeType && f.mimeType.includes('audio'));
        }
      } else {
        selectedFormat = info.format.find(f => 
          f.mimeType && 
          f.mimeType.includes('video/mp4') && 
          f.hasOwnProperty('audioChannels') &&
          !f.hasOwnProperty('s') &&
          f.url
        );
        if (!selectedFormat) {
          selectedFormat = info.format.find(f => 
            f.mimeType && 
            f.mimeType.includes('video/mp4') && 
            f.hasOwnProperty('audioChannels')
          );
        }
      }

      if (!selectedFormat) {
        selectedFormat = info.format.find(f => !f.hasOwnProperty('s') && f.url);
      }
      
      if (!selectedFormat) {
        selectedFormat = info.format[0];
      }

      let downloadUrl = selectedFormat.url;
      
      if (selectedFormat.hasOwnProperty('s')) {
        const decipher = await play.decipher(info.html5player, selectedFormat.s);
        const sp = selectedFormat.sp || 'sig';
        downloadUrl = `${downloadUrl}&${sp}=${encodeURIComponent(decipher)}`;
      }

      const writeStream = fs.createWriteStream(filePath);

      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          response.pipe(writeStream);
          writeStream.on('finish', () => {
            writeStream.close();
            resolve();
          });
          writeStream.on('error', reject);
        }).on('error', reject);
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
