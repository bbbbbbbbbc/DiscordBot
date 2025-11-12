const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Zamyka kanał - użytkownicy nie mogą pisać')
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód blokady')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return await interaction.reply({ content: '❌ Nie masz uprawnień do zarządzania kanałami!', ephemeral: true });
      }

      const channel = interaction.channel;
      const reason = interaction.options.getString('powód') || 'Nie podano powodu';

      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false
      });

      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🔒 Kanał Zablokowany')
        .setDescription(`Kanał ${channel} został zablokowany!`)
        .addFields(
          { name: 'Powód', value: reason, inline: false },
          { name: 'Zablokowany przez', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie lockdown:', error);
      await interaction.reply({ content: '❌ Nie udało się zablokować kanału!', ephemeral: true });
    }
  },
};
