const { EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  name: 'resume',
  description: 'Wznów odtwarzanie',
  aliases: ['unpause'],
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ Musisz być na kanale głosowym!');
    }

    if (!client.musicQueue || !client.musicQueue.has(message.guild.id)) {
      return message.reply('❌ Nie gram żadnej muzyki!');
    }

    const queue = client.musicQueue.get(message.guild.id);
    
    if (queue.player.state.status !== AudioPlayerStatus.Paused) {
      return message.reply('❌ Muzyka nie jest wstrzymana!');
    }

    queue.player.unpause();

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('▶️ Wznowiono')
      .setDescription('Odtwarzanie zostało wznowione')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
