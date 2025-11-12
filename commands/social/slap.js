const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Spolicz kogoś')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego chcesz spoliczkować')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const slapper = interaction.user;
      const target = interaction.options.getUser('użytkownik');

      if (target.id === slapper.id) {
        return await interaction.reply({ content: '❌ Nie możesz spoliczkować samego siebie!', ephemeral: true });
      }

      const slapGifs = [
        'https://media.tenor.com/x7CW7nR-lXYAAAAC/anime-slap.gif',
        'https://media.tenor.com/kNl_KHhPF34AAAAC/slap-anime.gif',
        'https://media.tenor.com/Up37aN9cQS4AAAAC/bofetada-slap.gif'
      ];

      const randomGif = slapGifs[Math.floor(Math.random() * slapGifs.length)];

      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('👋 Policzek!')
        .setDescription(`${slapper} spoliczkował ${target}! 😠💥`)
        .setImage(randomGif)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie slap:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas policzkowania!', ephemeral: true });
    }
  },
};
