const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'stop',
  description: 'Zatrzymaj muzykę i opuść kanał',
  aliases: ['leave', 'disconnect'],
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ Musisz być na kanale głosowym!');
    }

    if (!client.musicQueue || !client.musicQueue.has(message.guild.id)) {
      return message.reply('❌ Nie gram żadnej muzyki!');
    }

    const queue = client.musicQueue.get(message.guild.id);
    
    queue.player.stop();
    queue.connection.destroy();
    client.musicQueue.delete(message.guild.id);

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⏹️ Zatrzymano muzykę')
      .setDescription('Odtwarzanie zostało zatrzymane i opuściłem kanał')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
