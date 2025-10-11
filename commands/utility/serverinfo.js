const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Informacje o serwerze',
  aliases: ['server'],
  async execute(message) {
    const { guild } = message;
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 Właściciel', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 Członkowie', value: `${guild.memberCount}`, inline: true },
        { name: '📅 Utworzono', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '💬 Kanały', value: `${guild.channels.cache.size}`, inline: true },
        { name: '😀 Emoji', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🎭 Role', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
