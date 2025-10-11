const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'volume',
  description: 'Ustaw głośność (1-100)',
  aliases: ['vol'],
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ Musisz być na kanale głosowym!');
    }

    if (!client.musicQueue || !client.musicQueue.has(message.guild.id)) {
      return message.reply('❌ Nie gram żadnej muzyki!');
    }

    const volume = parseInt(args[0]);

    if (!volume || volume < 1 || volume > 100) {
      return message.reply('❌ Podaj głośność od 1 do 100!');
    }

    const queue = client.musicQueue.get(message.guild.id);
    
    if (queue.player.state.resource && queue.player.state.resource.volume) {
      queue.player.state.resource.volume.setVolume(volume / 100);
    }

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('🔊 Głośność')
      .setDescription(`Ustawiono głośność na **${volume}%**`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
