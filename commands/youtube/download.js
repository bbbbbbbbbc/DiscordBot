const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { getUncachableGoogleDriveClient } = require('../../utils/googleDrive');

module.exports = {
  name: 'download',
  description: 'Pobierz film/muzykę z YouTube i prześlij na Google Drive',
  aliases: ['dl', 'ytdl'],
  async execute(message, args) {
    const url = args[0];
    
    if (!url || !ytdl.validateURL(url)) {
      return message.reply('❌ Podaj prawidłowy link do YouTube! Użyj: `!download [link YouTube]`');
    }

    const statusMsg = await message.reply('⏳ Rozpoczynam pobieranie...');

    try {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').substring(0, 50);
      const format = args[1] === 'audio' ? 'audio' : 'video';
      
      const fileName = `${title}.${format === 'audio' ? 'mp3' : 'mp4'}`;
      const filePath = path.join(__dirname, '../../downloads', fileName);

      if (!fs.existsSync(path.join(__dirname, '../../downloads'))) {
        fs.mkdirSync(path.join(__dirname, '../../downloads'), { recursive: true });
      }

      await statusMsg.edit(`📥 Pobieranie: **${info.videoDetails.title}**...`);

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

      await statusMsg.edit('☁️ Przesyłam na Google Drive...');

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

      await statusMsg.edit(`✅ **Gotowe!**\n\n📁 Plik: **${info.videoDetails.title}**\n🔗 Link: ${driveFile.data.webViewLink}\n💾 Zapisano na Google Drive!`);

    } catch (error) {
      console.error('Download error:', error);
      await statusMsg.edit('❌ Wystąpił błąd podczas pobierania! Upewnij się, że link jest prawidłowy.');
    }
  },
};
