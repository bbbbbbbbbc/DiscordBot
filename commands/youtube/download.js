const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
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
      url = interaction.options.getString('url');
      format = interaction.options.getString('format') || 'video';
    } else {
      url = args[0];
      format = args[1] === 'audio' ? 'audio' : 'video';
    }
    
    if (!url || !ytdl.validateURL(url)) {
      const message = '❌ Podaj prawidłowy link do YouTube! Użyj: `!download [link YouTube]`';
      if (isSlash) {
        return await interaction.reply(message);
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
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').substring(0, 50);
      
      const fileName = `${title}.${format === 'audio' ? 'mp3' : 'mp4'}`;
      const filePath = path.join(__dirname, '../../downloads', fileName);

      if (!fs.existsSync(path.join(__dirname, '../../downloads'))) {
        fs.mkdirSync(path.join(__dirname, '../../downloads'), { recursive: true });
      }

      const downloadingMsg = `📥 Pobieranie: **${info.videoDetails.title}**...`;
      if (isSlash) {
        await interaction.editReply(downloadingMsg);
      } else {
        await statusMsg.edit(downloadingMsg);
      }

      const stream = ytdl(url, {
        quality: format === 'audio' ? 'highestaudio' : 'highest',
        filter: format === 'audio' ? 'audioonly' : 'audioandvideo'
      });

      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
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

      const successMsg = `✅ **Gotowe!**\n\n📁 Plik: **${info.videoDetails.title}**\n🔗 Link: ${driveFile.data.webViewLink}\n💾 Zapisano na Google Drive!`;
      if (isSlash) {
        await interaction.editReply(successMsg);
      } else {
        await statusMsg.edit(successMsg);
      }

    } catch (error) {
      console.error('Download error:', error);
      const errorMsg = '❌ Wystąpił błąd podczas pobierania! Upewnij się, że link jest prawidłowy.';
      if (isSlash) {
        await interaction.editReply(errorMsg);
      } else {
        await statusMsg.edit(errorMsg);
      }
    }
  },
};
