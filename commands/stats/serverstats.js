const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Statystyki serwera'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const guild = isSlash ? interaction.guild : interaction.guild;

    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const roles = guild.roles.cache.size;

    const createdAt = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 Statystyki: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👥 Członkowie', value: `${totalMembers}`, inline: true },
        { name: '🟢 Online', value: `${onlineMembers}`, inline: true },
        { name: '🤖 Boty', value: `${bots}`, inline: true },
        { name: '💬 Kanały tekstowe', value: `${textChannels}`, inline: true },
        { name: '🔊 Kanały głosowe', value: `${voiceChannels}`, inline: true },
        { name: '🎭 Role', value: `${roles}`, inline: true },
        { name: '👑 Właściciel', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Utworzono', value: `<t:${createdAt}:R>`, inline: true },
        { name: '🆔 ID Serwera', value: `\`${guild.id}\``, inline: true }
      )
      .setFooter({ text: `Serwer ${guild.name}` })
      .setTimestamp();

    if (guild.description) {
      embed.setDescription(guild.description);
    }

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
