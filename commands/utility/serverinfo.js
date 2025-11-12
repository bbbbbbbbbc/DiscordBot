const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Informacje o serwerze'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const guild = isSlash ? interaction.guild : interaction.guild;
    
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

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
