const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Usuń wiadomości użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego wiadomości chcesz usunąć')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('liczba')
        .setDescription('Liczba wiadomości do sprawdzenia (1-100)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return await interaction.reply({ content: '❌ Nie masz uprawnień do zarządzania wiadomościami!', ephemeral: true });
      }

      const user = interaction.options.getUser('użytkownik');
      const limit = interaction.options.getInteger('liczba') || 100;

      await interaction.deferReply({ ephemeral: true });

      const messages = await interaction.channel.messages.fetch({ limit: limit });
      const userMessages = messages.filter(msg => msg.author.id === user.id);

      if (userMessages.size === 0) {
        return await interaction.editReply({ content: '❌ Nie znaleziono wiadomości tego użytkownika!' });
      }

      const deleted = await interaction.channel.bulkDelete(userMessages, true);

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('🗑️ Wiadomości Usunięte')
        .setDescription(`Usunięto **${deleted.size}** wiadomości od ${user}`)
        .addFields(
          { name: 'Usunięte przez', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error('Nie można usunąć wiadomości:', error);
        }
      }, 5000);
    } catch (error) {
      console.error('Błąd w komendzie purge:', error);
      await interaction.editReply({ content: '❌ Nie udało się usunąć wiadomości!' });
    }
  },
};
