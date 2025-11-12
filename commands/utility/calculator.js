const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calculator')
    .setDescription('Wykonaj obliczenia matematyczne')
    .addStringOption(option =>
      option.setName('wyrażenie')
        .setDescription('Wyrażenie matematyczne (np. 2+2, 10*5, 100/4)')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const expression = interaction.options.getString('wyrażenie');
      
      // Bezpieczna walidacja
      if (!/^[\d+\-*/(). ]+$/.test(expression)) {
        return await interaction.reply({ content: '❌ Nieprawidłowe wyrażenie! Użyj tylko cyfr i operatorów (+, -, *, /, ())', ephemeral: true });
      }

      let result;
      try {
        result = eval(expression);
      } catch (error) {
        return await interaction.reply({ content: '❌ Błąd w obliczeniach! Sprawdź wyrażenie.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('🔢 Kalkulator')
        .addFields(
          { name: '📝 Wyrażenie', value: `\`${expression}\`` },
          { name: '✅ Wynik', value: `\`${result}\`` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie calculator:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas obliczeń!', ephemeral: true });
    }
  },
};
