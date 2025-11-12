const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer2')
    .setDescription('Ustaw minutnik')
    .addIntegerOption(option =>
      option.setName('sekundy')
        .setDescription('Czas w sekundach (1-300)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(300)
    )
    .addStringOption(option =>
      option.setName('wiadomość')
        .setDescription('Wiadomość przypomnienia')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const seconds = interaction.options.getInteger('sekundy');
      const message = interaction.options.getString('wiadomość') || 'Czas minął!';

      const embed = new EmbedBuilder()
        .setColor('#F39C12')
        .setTitle('⏱️ Minutnik Ustawiony')
        .setDescription(`Przypomnę Ci za **${seconds}** sekund!`)
        .addFields(
          { name: '💬 Wiadomość', value: message }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      setTimeout(async () => {
        const reminderEmbed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('⏰ Przypomnienie!')
          .setDescription(message)
          .addFields(
            { name: '⏱️ Ustawiono', value: `${seconds} sekund temu` }
          )
          .setTimestamp();

        try {
          await interaction.followUp({ content: `${interaction.user}`, embeds: [reminderEmbed] });
        } catch (error) {
          console.error('Błąd podczas wysyłania przypomnienia:', error);
        }
      }, seconds * 1000);
    } catch (error) {
      console.error('Błąd w komendzie timer2:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas ustawiania minutnika!', ephemeral: true });
    }
  },
};
