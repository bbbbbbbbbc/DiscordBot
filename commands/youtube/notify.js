const { google } = require('googleapis');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ytnotify',
  description: 'Ustawia powiadomienia o nowych filmach na kanale YouTube',
  async execute(message, args, client) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Tylko administrator może ustawić powiadomienia!');
    }

    const channelId = args[0];
    const discordChannelId = message.channel.id;

    if (!channelId) {
      return message.reply('❌ Podaj ID kanału YouTube! Użyj: `!ytnotify [ID kanału YouTube]`');
    }

    try {
      if (!client.youtubeNotifications) {
        client.youtubeNotifications = new Map();
      }

      client.youtubeNotifications.set(message.guild.id, {
        youtubeChannelId: channelId,
        discordChannelId: discordChannelId,
        lastVideoId: null
      });

      message.reply(`✅ Powiadomienia YouTube włączone!\n📺 Kanał YT: ${channelId}\n💬 Powiadomienia na: <#${discordChannelId}>`);

      checkYouTubeUpdates(client);
      setInterval(() => checkYouTubeUpdates(client), 300000);

    } catch (error) {
      console.error('YouTube notify error:', error);
      message.reply('❌ Wystąpił błąd podczas ustawiania powiadomień!');
    }
  },
};

async function checkYouTubeUpdates(client) {
  if (!client.youtubeNotifications || client.youtubeNotifications.size === 0) return;

  for (const [guildId, config] of client.youtubeNotifications.entries()) {
    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY
      });

      const response = await youtube.search.list({
        part: 'snippet',
        channelId: config.youtubeChannelId,
        order: 'date',
        maxResults: 1,
        type: 'video'
      });

      if (response.data.items && response.data.items.length > 0) {
        const latestVideo = response.data.items[0];
        
        if (config.lastVideoId !== latestVideo.id.videoId) {
          config.lastVideoId = latestVideo.id.videoId;

          const channel = await client.channels.fetch(config.discordChannelId);
          
          const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🎥 Nowy film na YouTube!')
            .setDescription(`**${latestVideo.snippet.title}**`)
            .setThumbnail(latestVideo.snippet.thumbnails.high.url)
            .setURL(`https://www.youtube.com/watch?v=${latestVideo.id.videoId}`)
            .addFields(
              { name: 'Kanał', value: latestVideo.snippet.channelTitle },
              { name: 'Link', value: `https://www.youtube.com/watch?v=${latestVideo.id.videoId}` }
            )
            .setTimestamp();

          channel.send({ content: '@everyone', embeds: [embed] });
        }
      }
    } catch (error) {
      console.error(`YouTube check error for guild ${guildId}:`, error);
    }
  }
}
