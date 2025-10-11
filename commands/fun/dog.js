const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'dog',
  description: 'Losowe zdjęcie psa',
  aliases: ['doggo', 'pies'],
  async execute(message, args, client) {
    try {
      const response = await axios.get('https://dog.ceo/api/breeds/image/random');
      const dogImage = response.data.message;

      const embed = new EmbedBuilder()
        .setColor('#8B4513')
        .setTitle('🐕 Oto twój pies!')
        .setImage(dogImage)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Nie udało się pobrać zdjęcia psa!');
    }
  },
};
