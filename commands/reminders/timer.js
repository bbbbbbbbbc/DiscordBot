const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'timer',
  description: 'Timer odliczający',
  aliases: ['countdown', 'odliczanie'],
  async execute(message, args, client) {
    if (!args[0]) {
      return message.reply('❌ Użyj: !timer <czas>\nPrzykład: !timer 5m');
    }

    const timeArg = args[0].toLowerCase();
    let seconds = 0;

    if (timeArg.endsWith('s')) {
      seconds = parseInt(timeArg);
    } else if (timeArg.endsWith('m')) {
      seconds = parseInt(timeArg) * 60;
    } else if (timeArg.endsWith('h')) {
      seconds = parseInt(timeArg) * 3600;
    } else {
      return message.reply('❌ Nieprawidłowy format czasu! Użyj: 30s, 5m, 2h');
    }

    if (seconds < 1 || seconds > 3600) {
      return message.reply('❌ Czas musi być między 1s a 1h!');
    }

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⏱️ Timer')
      .setDescription(`Odliczanie: **${seconds}s**`)
      .setTimestamp();

    const msg = await message.reply({ embeds: [embed] });

    const interval = setInterval(() => {
      seconds--;
      
      if (seconds <= 0) {
        clearInterval(interval);
        
        const doneEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('⏱️ Timer zakończony!')
          .setDescription('🔔 Czas minął!')
          .setTimestamp();
        
        msg.edit({ embeds: [doneEmbed] });
        message.channel.send(`${message.author} ⏱️ Timer zakończony!`);
      } else if (seconds % 10 === 0 || seconds <= 5) {
        const updateEmbed = new EmbedBuilder()
          .setColor('#3498DB')
          .setTitle('⏱️ Timer')
          .setDescription(`Odliczanie: **${seconds}s**`)
          .setTimestamp();
        
        msg.edit({ embeds: [updateEmbed] }).catch(() => {});
      }
    }, 1000);
  },
};
