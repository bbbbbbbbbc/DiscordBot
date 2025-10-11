const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Pokaż kolejkę utworów',
  aliases: ['q', 'playlist'],
  async execute(message, args, client) {
    if (!client.musicQueue || !client.musicQueue.has(message.guild.id)) {
      return message.reply('❌ Kolejka jest pusta!');
    }

    const queue = client.musicQueue.get(message.guild.id);
    
    if (!queue.queue || queue.queue.length === 0) {
      return message.reply('❌ Kolejka jest pusta!');
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🎵 Kolejka utworów')
      .setDescription(
        queue.queue.map((song, index) => {
          return `${index + 1}. [${song.title}](${song.url}) - \`${song.durationRaw}\``;
        }).join('\n')
      )
      .setFooter({ text: `Utworów w kolejce: ${queue.queue.length}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
