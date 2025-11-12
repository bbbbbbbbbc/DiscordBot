const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Przytul kogoś')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego chcesz przytulić')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const hugger = interaction.user;
      const target = interaction.options.getUser('użytkownik');

      if (target.id === hugger.id) {
        return await interaction.reply({ content: '❌ Nie możesz przytulić samego siebie!', ephemeral: true });
      }

      const hugGifs = [
        'https://media.tenor.com/LNbE0contrQAAAAC/hug.gif',
        'https://media.tenor.com/UcIPdf2q9_oAAAAC/anime-hug.gif',
        'https://media.tenor.com/kLbfXOC2GY0AAAAC/hug.gif'
      ];

      const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('🤗 Przytulenie!')
        .setDescription(`${hugger} przytula ${target}! 💕`)
        .setImage(randomGif)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie hug:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas przytulania!', ephemeral: true });
    }
  },
};
