const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'meme',
  description: 'Losowy mem z Reddita',
  aliases: ['reddit', 'funnymeme'],
  async execute(message, args, client) {
    try {
      const response = await axios.get('https://meme-api.com/gimme');
      const meme = response.data;

      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle(meme.title)
        .setImage(meme.url)
        .setURL(meme.postLink)
        .setFooter({ text: `👍 ${meme.ups} | r/${meme.subreddit}` })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Nie udało się pobrać mema!');
    }
  },
};
