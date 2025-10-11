const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'skip',
  description: 'Pomiń aktualny utwór',
  aliases: ['s', 'next'],
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ Musisz być na kanale głosowym!');
    }

    if (!client.musicQueue || !client.musicQueue.has(message.guild.id)) {
      return message.reply('❌ Nie gram żadnej muzyki!');
    }

    const queue = client.musicQueue.get(message.guild.id);
    
    if (queue.queue.length <= 1) {
      queue.player.stop();
      queue.connection.destroy();
      client.musicQueue.delete(message.guild.id);
      return message.reply('⏭️ Pominięto utwór i zakończono odtwarzanie (brak kolejnych utworów)');
    }

    queue.player.stop();

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⏭️ Pominięto utwór')
      .setDescription('Odtwarzam następny utwór z kolejki')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
