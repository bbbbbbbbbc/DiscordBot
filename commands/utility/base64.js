const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('base64')
    .setDescription('Koduj/dekoduj Base64')
    .addStringOption(option =>
      option.setName('typ')
        .setDescription('Typ operacji')
        .setRequired(true)
        .addChoices(
          { name: 'Koduj', value: 'encode' },
          { name: 'Dekoduj', value: 'decode' }
        )
    )
    .addStringOption(option =>
      option.setName('tekst')
        .setDescription('Tekst do zakodowania/dekodowania')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const type = interaction.options.getString('typ');
      const text = interaction.options.getString('tekst');
      let result;

      if (type === 'encode') {
        result = Buffer.from(text, 'utf8').toString('base64');
      } else {
        try {
          result = Buffer.from(text, 'base64').toString('utf8');
        } catch (error) {
          return await interaction.reply({ content: '❌ Nieprawidłowy format Base64!', ephemeral: true });
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#1ABC9C')
        .setTitle('🔐 Base64')
        .addFields(
          { name: '📝 Wejście', value: `\`\`\`${text}\`\`\`` },
          { name: '✅ Wynik', value: `\`\`\`${result}\`\`\`` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie base64:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas kodowania/dekodowania!', ephemeral: true });
    }
  },
};
