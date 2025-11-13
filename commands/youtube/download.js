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
    )
    .addStringOption(option =>
      option.setName('quality')
        .setDescription('Jakość wideo (tylko dla formatu wideo)')
        .setRequired(false)
        .addChoices(
          { name: '360p (niska jakość, mały plik)', value: '360' },
          { name: '480p (średnia jakość)', value: '480' },
          { name: '720p HD (dobra jakość)', value: '720' },
          { name: '1080p Full HD (wysoka jakość)', value: '1080' },
          { name: '1440p 2K (bardzo wysoka jakość)', value: '1440' },
          { name: '2160p 4K (maksymalna jakość)', value: '2160' },
          { name: 'Najlepsza dostępna', value: 'best' }
        )
    )
    .addStringOption(option =>
      option.setName('wyslijdo')
        .setDescription('Gdzie wysłać pobrany plik?')
        .setRequired(false)
        .addChoices(
          { name: '☁️ Google Drive (link do pliku)', value: 'drive' },
          { name: '💬 Discord (załącznik, max 25MB)', value: 'discord' },
          { name: '📤 Oba (Drive + Discord)', value: 'both' }
        )
    ),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    let url, format, quality, destination;
    if (isSlash) {
      url = interaction.options?.getString('url');
      format = interaction.options?.getString('format') || 'audio';
      quality = interaction.options?.getString('quality') || 'best';
      destination = interaction.options?.getString('wyslijdo') || 'drive';
    } else {
      url = args[0];
      format = args[1] === 'video' ? 'video' : 'audio';
      quality = args[2] || 'best';
      destination = args[3] || 'drive';
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

      const qualityText = format === 'video' && quality !== 'best' ? ` (${quality}p)` : '';
      const formatEmoji = format === 'audio' ? '🎵' : '🎬';
      const destEmoji = destination === 'drive' ? '☁️' : destination === 'discord' ? '💬' : '📤';
      const downloadingMsg = `${formatEmoji} **Pobieranie...**\n\n📁 Plik: **${sanitizedTitle}**${artist ? `\n👤 Artysta: ${artist}` : ''}${qualityText ? `\n📺 Jakość: ${quality}p` : ''}\n${destEmoji} Cel: ${destination === 'drive' ? 'Google Drive' : destination === 'discord' ? 'Discord' : 'Drive + Discord'}\n\n⏳ Trwa pobieranie...`;
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
        let formatString;
        
        if (quality === 'best') {
          formatString = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        } else {
          const height = quality;
          formatString = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
        }
        
        ytdlpOptions.format = formatString;
        ytdlpOptions.mergeOutputFormat = 'mp4';
      }

      await youtubedl(youtubeUrl, ytdlpOptions);

      if (!fs.existsSync(filePath)) {
        throw new Error('Pobieranie nie powiodło się - plik nie został utworzony. Film może być niedostępny lub zabezpieczony.');
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      const processingMsg = `✅ **Pobrano!**\n\n📁 Rozmiar: **${fileSizeMB} MB**\n⏳ Przesyłam plik...`;
      if (isSlash) {
        await interaction.editReply(processingMsg);
      } else {
        await statusMsg.edit(processingMsg);
      }

      let driveLink = null;
      let discordAttachment = null;

      if (destination === 'drive' || destination === 'both') {
        const uploadingMsg = `☁️ **Przesyłam na Google Drive...**\n\n📁 Rozmiar: ${fileSizeMB} MB`;
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

        driveLink = driveFile.data.webViewLink;
      }

      if (destination === 'discord' || destination === 'both') {
        if (stats.size > 25 * 1024 * 1024) {
          const sizeWarning = `⚠️ **Plik jest za duży dla Discord!**\n\n📁 Rozmiar: ${fileSizeMB} MB (max 25 MB)\n${driveLink ? `✅ Dostępny na Google Drive!` : '❌ Wybierz Google Drive jako cel'}`;
          if (isSlash) {
            await interaction.editReply(sizeWarning);
          } else {
            await statusMsg.edit(sizeWarning);
          }
        } else {
          discordAttachment = filePath;
        }
      }

      const platform = url.includes('spotify.com') ? '🎵 Spotify' : '📺 YouTube';
      const qualityInfo = format === 'video' && quality !== 'best' ? `\n📺 Jakość: ${quality}p` : '';
      
      let successMsg = `✅ **Gotowe!**\n\n${platform}\n📁 Plik: **${sanitizedTitle}**${artist ? `\n👤 Artysta: ${artist}` : ''}${qualityInfo}\n💾 Rozmiar: ${fileSizeMB} MB`;
      
      if (driveLink) {
        successMsg += `\n\n☁️ **Google Drive:**\n🔗 ${driveLink}`;
      }
      
      if (discordAttachment) {
        successMsg += `\n\n💬 **Discord:** Plik w załączniku poniżej`;
      }

      if (isSlash) {
        if (discordAttachment) {
          await interaction.editReply({ content: successMsg, files: [{ attachment: discordAttachment, name: fileName }] });
        } else {
          await interaction.editReply(successMsg);
        }
      } else {
        if (discordAttachment) {
          await statusMsg.edit({ content: successMsg, files: [{ attachment: discordAttachment, name: fileName }] });
        } else {
          await statusMsg.edit(successMsg);
        }
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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
        } else if (error.message.includes('ffmpeg') || error.message.includes('ffprobe')) {
          errorMsg = '❌ Błąd konwersji audio. Spróbuj ponownie.';
        } else if (error.stderr && error.stderr.includes('cookies are no longer valid')) {
          errorMsg = '❌ Błąd pobierania. Film może wymagać logowania lub jest niedostępny.';
        } else if (error.message.includes('Requested format is not available') || 
                   error.stderr?.includes('Requested format is not available')) {
          errorMsg = `❌ Wybrana jakość ${quality}p nie jest dostępna dla tego filmu. Spróbuj niższej jakości.`;
        } else {
          const shortMsg = error.message.substring(0, 100);
          errorMsg = `❌ Błąd: ${shortMsg}${error.message.length > 100 ? '...' : ''}`;
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
