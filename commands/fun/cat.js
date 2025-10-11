const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'cat',
  description: 'Losowe zdjęcie kota',
  aliases: ['kitty', 'kot'],
  async execute(message, args, client) {
    try {
      const response = await axios.get('https://api.thecatapi.com/v1/images/search');
      const catImage = response.data[0].url;

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🐱 Oto twój kot!')
        .setImage(catImage)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Nie udało się pobrać zdjęcia kota!');
    }
  },
};
