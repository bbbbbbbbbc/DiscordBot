const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Sprawdź pogodę (symulacja)')
    .addStringOption(option =>
      option.setName('miasto')
        .setDescription('Nazwa miasta')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const city = interaction.options.getString('miasto');
      
      // Symulacja danych pogodowych
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ['☀️ Słonecznie', '⛅ Częściowo pochmurno', '☁️ Pochmurno', '🌧️ Deszczowo', '⛈️ Burza'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const humidity = Math.floor(Math.random() * 40) + 40;
      const wind = Math.floor(Math.random() * 20) + 5;

      const embed = new EmbedBuilder()
        .setColor('#87CEEB')
        .setTitle(`🌤️ Pogoda w ${city}`)
        .addFields(
          { name: '🌡️ Temperatura', value: `${temp}°C`, inline: true },
          { name: '☁️ Warunki', value: condition, inline: true },
          { name: '💧 Wilgotność', value: `${humidity}%`, inline: true },
          { name: '💨 Wiatr', value: `${wind} km/h`, inline: true }
        )
        .setFooter({ text: 'To jest wersja demonstracyjna. Zintegruj API pogodowe dla prawdziwych danych!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie weather:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas sprawdzania pogody!', ephemeral: true });
    }
  },
};
