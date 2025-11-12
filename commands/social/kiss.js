const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Pocałuj kogoś')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego chcesz pocałować')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const kisser = interaction.user;
      const target = interaction.options.getUser('użytkownik');

      if (target.id === kisser.id) {
        return await interaction.reply({ content: '❌ Nie możesz pocałować samego siebie!', ephemeral: true });
      }

      const kissGifs = [
        'https://media.tenor.com/BIau-27RPi8AAAAC/anime-kiss.gif',
        'https://media.tenor.com/jk7gBnhRe0sAAAAC/kiss-anime.gif',
        'https://media.tenor.com/T_OjIFduEYMAAAAC/anime-kiss.gif'
      ];

      const randomGif = kissGifs[Math.floor(Math.random() * kissGifs.length)];

      const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('💋 Pocałunek!')
        .setDescription(`${kisser} całuje ${target}! 😘💕`)
        .setImage(randomGif)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie kiss:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas całowania!', ephemeral: true });
    }
  },
};
