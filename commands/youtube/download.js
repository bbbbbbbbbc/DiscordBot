const ytdl = require('@distube/ytdl-core');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const { getUncachableGoogleDriveClient } = require('../../utils/googleDrive');
const ytSearch = require('yt-search');
const { SlashCommandBuilder } = require('discord.js');
const { getData } = require('spotify-url-info');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('download')
    .setDescription('Pobierz muzykę/film z YouTube, Spotify i innych platform')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Link do YouTube, Spotify, Vimeo, SoundCloud, etc.')
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
      format = interaction.options?.getString('format') || 'audio';
    } else {
      url = args[0];
      format = args[1] === 'video' ? 'video' : 'audio';
    }
    
    if (!url) {
      const message = '❌ Musisz podać URL! Użyj: `/download url:[link]`';
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
      const downloadsDir = path.join(__dirname, '../../downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      let youtubeUrl;
      let title;
      let artist = '';

      if (url.includes('spotify.com')) {
        const processingMsg = '🎵 Przetwarzam link Spotify...';
        if (isSlash) {
          await interaction.editReply(processingMsg);
        } else {
          await statusMsg.edit(processingMsg);
        }

        try {
          const spotifyData = await getData(url);
          
          if (spotifyData.type === 'track') {
            title = spotifyData.name;
            artist = spotifyData.artists?.[0]?.name || '';
            
            const searchQuery = artist ? `${artist} ${title}` : title;
            const searchMsg = `🔍 Szukam na YouTube: **${searchQuery}**...`;
            if (isSlash) {
              await interaction.editReply(searchMsg);
            } else {
              await statusMsg.edit(searchMsg);
            }

            const searchResults = await ytSearch(searchQuery);
            if (!searchResults.videos || searchResults.videos.length === 0) {
              throw new Error('Nie znaleziono utworu na YouTube');
            }
            
            youtubeUrl = searchResults.videos[0].url;
          } else if (spotifyData.type === 'playlist' || spotifyData.type === 'album') {
            throw new Error('Playlisty i albumy nie są obsługiwane. Podaj link do pojedynczego utworu.');
          } else {
            throw new Error('Nieobsługiwany typ Spotify');
          }
        } catch (spotifyError) {
          console.error('Spotify error:', spotifyError);
          throw new Error(`Błąd Spotify: ${spotifyError.message}`);
        }
      } else if (ytdl.validateURL(url)) {
        youtubeUrl = url;
      } else {
        throw new Error('Nieobsługiwany link! Obsługiwane platformy: YouTube, Spotify');
      }

      if (!title) {
        const info = await ytdl.getBasicInfo(youtubeUrl);
        title = info.videoDetails.title;
      }
      
      const sanitizedTitle = title.replace(/[^\w\s-]/gi, '').substring(0, 50);
      const fileExt = format === 'audio' ? 'mp3' : 'mp4';
      const fileName = `${sanitizedTitle}.${fileExt}`;
      filePath = path.join(downloadsDir, fileName);

      const downloadingMsg = `📥 Pobieranie: **${sanitizedTitle}**${artist ? ` - ${artist}` : ''}...`;
      if (isSlash) {
        await interaction.editReply(downloadingMsg);
      } else {
        await statusMsg.edit(downloadingMsg);
      }

      const ytdlpOptions = {
        output: filePath,
        noPlaylist: true,
      };

      if (format === 'audio') {
        ytdlpOptions.extractAudio = true;
        ytdlpOptions.audioFormat = 'mp3';
        ytdlpOptions.audioQuality = 0;
      } else {
        ytdlpOptions.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        ytdlpOptions.mergeOutputFormat = 'mp4';
      }

      if (process.env.YOUTUBE_COOKIES) {
        const cookiesFile = path.join(downloadsDir, 'cookies.txt');
        const cookiesNetscape = process.env.YOUTUBE_COOKIES.split(';').map(cookie => {
          const [name, value] = cookie.trim().split('=');
          return `.youtube.com\tTRUE\t/\tTRUE\t0\t${name.trim()}\t${value || ''}`;
        }).join('\n');
        fs.writeFileSync(cookiesFile, `# Netscape HTTP Cookie File\n${cookiesNetscape}`);
        ytdlpOptions.cookies = cookiesFile;
      }

      await youtubedl(youtubeUrl, ytdlpOptions);

      if (ytdlpOptions.cookies && fs.existsSync(ytdlpOptions.cookies)) {
        fs.unlinkSync(ytdlpOptions.cookies);
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

      const platform = url.includes('spotify.com') ? '🎵 Spotify' : '📺 YouTube';
      const successMsg = `✅ **Gotowe!**\n\n${platform}\n📁 Plik: **${sanitizedTitle}**${artist ? `\n👤 Artysta: ${artist}` : ''}\n🔗 Link: ${driveFile.data.webViewLink}\n💾 Zapisano na Google Drive!`;
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
        } else if (error.message.includes('Spotify')) {
          errorMsg = `❌ ${error.message}`;
        } else if (error.message.includes('Nie znaleziono')) {
          errorMsg = `❌ ${error.message}`;
        } else {
          errorMsg = `❌ Błąd: ${error.message}`;
        }
      }
      
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
