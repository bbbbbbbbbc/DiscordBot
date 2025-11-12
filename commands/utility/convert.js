const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Konwertuj jednostki')
    .addStringOption(option =>
      option.setName('typ')
        .setDescription('Typ konwersji')
        .setRequired(true)
        .addChoices(
          { name: 'Temperatura (C do F)', value: 'c_to_f' },
          { name: 'Temperatura (F do C)', value: 'f_to_c' },
          { name: 'Długość (km do mil)', value: 'km_to_mi' },
          { name: 'Długość (mile do km)', value: 'mi_to_km' },
          { name: 'Waga (kg do lb)', value: 'kg_to_lb' },
          { name: 'Waga (lb do kg)', value: 'lb_to_kg' }
        )
    )
    .addNumberOption(option =>
      option.setName('wartość')
        .setDescription('Wartość do konwersji')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const type = interaction.options.getString('typ');
      const value = interaction.options.getNumber('wartość');
      let result, unit;

      switch(type) {
        case 'c_to_f':
          result = (value * 9/5) + 32;
          unit = '°F';
          break;
        case 'f_to_c':
          result = (value - 32) * 5/9;
          unit = '°C';
          break;
        case 'km_to_mi':
          result = value * 0.621371;
          unit = 'mil';
          break;
        case 'mi_to_km':
          result = value * 1.60934;
          unit = 'km';
          break;
        case 'kg_to_lb':
          result = value * 2.20462;
          unit = 'lb';
          break;
        case 'lb_to_kg':
          result = value * 0.453592;
          unit = 'kg';
          break;
      }

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('🔄 Konwerter Jednostek')
        .addFields(
          { name: '📊 Wejście', value: `${value}`, inline: true },
          { name: '✅ Wynik', value: `${result.toFixed(2)} ${unit}`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie convert:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas konwersji!', ephemeral: true });
    }
  },
};
