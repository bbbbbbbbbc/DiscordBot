const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Wygeneruj losową liczbę')
    .addIntegerOption(option =>
      option.setName('minimum')
        .setDescription('Minimalna wartość')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('maksimum')
        .setDescription('Maksymalna wartość')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const min = interaction.options.getInteger('minimum');
      const max = interaction.options.getInteger('maksimum');

      if (min >= max) {
        return await interaction.reply({ content: '❌ Minimum musi być mniejsze od maksimum!', ephemeral: true });
      }

      const random = Math.floor(Math.random() * (max - min + 1)) + min;

      const embed = new EmbedBuilder()
        .setColor('#16A085')
        .setTitle('🎲 Generator Losowych Liczb')
        .addFields(
          { name: '📊 Zakres', value: `${min} - ${max}`, inline: true },
          { name: '🎯 Wylosowana liczba', value: `**${random}**`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie random:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas losowania liczby!', ephemeral: true });
    }
  },
};
