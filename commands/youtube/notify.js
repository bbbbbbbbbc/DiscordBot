const { google } = require('googleapis');
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ytnotify')
    .setDescription('Ustawia powiadomienia o nowych filmach na kanale YouTube')
    .addStringOption(option =>
      option.setName('channel_id')
        .setDescription('ID kanału YouTube')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const guild = isSlash ? interaction.guild : interaction.guild;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    if (!member.permissions.has('Administrator')) {
      const message = '❌ Tylko administrator może ustawić powiadomienia!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    let channelId;
    if (isSlash) {
      channelId = interaction.options.getString('channel_id');
    } else {
      channelId = args[0];
      if (!channelId) {
        return interaction.reply('❌ Podaj ID kanału YouTube! Użyj: `!ytnotify [ID kanału YouTube]`');
      }
    }

    const discordChannelId = channel.id;

    try {
      if (!client.youtubeNotifications) {
        client.youtubeNotifications = new Map();
      }

      client.youtubeNotifications.set(guild.id, {
        youtubeChannelId: channelId,
        discordChannelId: discordChannelId,
        lastVideoId: null
      });

      const message = `✅ Powiadomienia YouTube włączone!\n📺 Kanał YT: ${channelId}\n💬 Powiadomienia na: <#${discordChannelId}>`;
      if (isSlash) {
        await interaction.reply(message);
      } else {
        interaction.reply(message);
      }

      checkYouTubeUpdates(client);
      setInterval(() => checkYouTubeUpdates(client), 300000);

    } catch (error) {
      console.error('YouTube notify error:', error);
      const message = '❌ Wystąpił błąd podczas ustawiania powiadomień!';
      if (isSlash) {
        await interaction.reply(message);
      } else {
        interaction.reply(message);
      }
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
