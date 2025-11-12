const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hex')
    .setDescription('Konwertuj tekst na HEX i odwrotnie')
    .addStringOption(option =>
      option.setName('typ')
        .setDescription('Typ konwersji')
        .setRequired(true)
        .addChoices(
          { name: 'Tekst do HEX', value: 'to_hex' },
          { name: 'HEX do tekstu', value: 'from_hex' }
        )
    )
    .addStringOption(option =>
      option.setName('wartość')
        .setDescription('Wartość do konwersji')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const type = interaction.options.getString('typ');
      const value = interaction.options.getString('wartość');
      let result;

      if (type === 'to_hex') {
        result = Buffer.from(value, 'utf8').toString('hex');
      } else {
        try {
          result = Buffer.from(value, 'hex').toString('utf8');
        } catch (error) {
          return await interaction.reply({ content: '❌ Nieprawidłowy format HEX!', ephemeral: true });
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🔤 Konwerter HEX')
        .addFields(
          { name: '📝 Wejście', value: `\`\`\`${value}\`\`\`` },
          { name: '✅ Wynik', value: `\`\`\`${result}\`\`\`` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie hex:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas konwersji!', ephemeral: true });
    }
  },
};
