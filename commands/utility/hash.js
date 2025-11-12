const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hash')
    .setDescription('Generuj hash tekstu')
    .addStringOption(option =>
      option.setName('algorytm')
        .setDescription('Algorytm hashowania')
        .setRequired(true)
        .addChoices(
          { name: 'MD5', value: 'md5' },
          { name: 'SHA1', value: 'sha1' },
          { name: 'SHA256', value: 'sha256' },
          { name: 'SHA512', value: 'sha512' }
        )
    )
    .addStringOption(option =>
      option.setName('tekst')
        .setDescription('Tekst do zahashowania')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const algorithm = interaction.options.getString('algorytm');
      const text = interaction.options.getString('tekst');

      const hash = crypto.createHash(algorithm).update(text).digest('hex');

      const embed = new EmbedBuilder()
        .setColor('#E67E22')
        .setTitle('🔒 Generator Hash')
        .addFields(
          { name: '📝 Tekst', value: `\`${text}\`` },
          { name: '🔐 Algorytm', value: algorithm.toUpperCase(), inline: true },
          { name: '✅ Hash', value: `\`\`\`${hash}\`\`\`` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie hash:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas generowania hash!', ephemeral: true });
    }
  },
};
