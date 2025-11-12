const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Odblokuj kanał - użytkownicy mogą pisać')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return await interaction.reply({ content: '❌ Nie masz uprawnień do zarządzania kanałami!', ephemeral: true });
      }

      const channel = interaction.channel;

      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null
      });

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('🔓 Kanał Odblokowany')
        .setDescription(`Kanał ${channel} został odblokowany!`)
        .addFields(
          { name: 'Odblokowany przez', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie unlock:', error);
      await interaction.reply({ content: '❌ Nie udało się odblokować kanału!', ephemeral: true });
    }
  },
};
