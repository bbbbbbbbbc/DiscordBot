const { EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  name: 'pause',
  description: 'Wstrzymaj odtwarzanie',
  aliases: [],
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ Musisz być na kanale głosowym!');
    }

    if (!client.musicQueue || !client.musicQueue.has(message.guild.id)) {
      return message.reply('❌ Nie gram żadnej muzyki!');
    }

    const queue = client.musicQueue.get(message.guild.id);
    
    if (queue.player.state.status === AudioPlayerStatus.Paused) {
      return message.reply('❌ Muzyka jest już wstrzymana!');
    }

    queue.player.pause();

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⏸️ Wstrzymano')
      .setDescription('Odtwarzanie zostało wstrzymane')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
