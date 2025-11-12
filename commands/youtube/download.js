const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { getUncachableGoogleDriveClient } = require('../../utils/googleDrive');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Pobierz film/muzykę z YouTube')
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
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
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

    let filePath;

    try {
      // Create downloads directory if it doesn't exist
      const downloadsDir = path.join(__dirname, '../../downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      // Get video info
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s-]/gi, '').substring(0, 50);
      
      // Set file extension based on format
      const fileExt = format === 'audio' ? 'mp3' : 'mp4';
      const fileName = `${title}.${fileExt}`;
      filePath = path.join(downloadsDir, fileName);

      const downloadingMsg = `📥 Pobieranie: **${title}**...`;
      if (isSlash) {
        await interaction.editReply(downloadingMsg);
      } else {
        await statusMsg.edit(downloadingMsg);
      }

      // Choose format
      const selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: format === 'audio' ? 'highestaudio' : 'highest',
        filter: format === 'audio' ? 'audioonly' : 'audioandvideo'
      });

      if (!selectedFormat) {
        throw new Error('Nie znaleziono odpowiedniego formatu dla tego filmu');
      }

      // Download from YouTube
      const stream = ytdl.downloadFromInfo(info, { format: selectedFormat });
      const writeStream = fs.createWriteStream(filePath);
      
      stream.pipe(writeStream);
      
      await new Promise((resolve, reject) => {
        // Add timeout (5 minutes)
        const timeout = setTimeout(() => {
          stream.destroy();
          writeStream.destroy();
          reject(new Error('TIMEOUT'));
        }, 5 * 60 * 1000);
        
        writeStream.on('finish', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        writeStream.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
        
        stream.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
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
        if (error.message.includes('Sign in to confirm your age') || 
            error.message.includes('login') || 
            error.message.includes('age')) {
          errorMsg = '❌ Ten film wymaga logowania lub jest niedostępny';
        } else if (error.statusCode === 403 || error.message.includes('403')) {
          errorMsg = '❌ YouTube zablokował pobieranie. Spróbuj innego filmu.';
        } else if (error.message === 'TIMEOUT') {
          errorMsg = '❌ Pobieranie trwało zbyt długo. Spróbuj krótszego filmu.';
        } else if (error.message.includes('unavailable')) {
          errorMsg = '❌ Film niedostępny! Może być zablokowany lub usunięty.';
        } else if (error.message.includes('No video id found')) {
          errorMsg = '❌ Nieprawidłowy link YouTube!';
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
