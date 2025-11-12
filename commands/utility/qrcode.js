const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Wygeneruj kod QR')
    .addStringOption(option =>
      option.setName('tekst')
        .setDescription('Tekst do zakodowania w QR')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const text = interaction.options.getString('tekst');
      const encodedText = encodeURIComponent(text);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;

      const embed = new EmbedBuilder()
        .setColor('#34495E')
        .setTitle('📱 Generator Kodu QR')
        .setDescription(`Kod QR dla: **${text}**`)
        .setImage(qrUrl)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie qrcode:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas generowania kodu QR!', ephemeral: true });
    }
  },
};
