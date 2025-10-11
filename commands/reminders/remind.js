const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'remind',
  description: 'Ustaw przypomnienie',
  aliases: ['reminder', 'przypomnij'],
  async execute(message, args, client) {
    if (args.length < 2) {
      return message.reply('❌ Użyj: !remind <czas> <wiadomość>\nPrzykład: !remind 10m Sprawdź piekarnik');
    }

    const timeArg = args[0].toLowerCase();
    const reminderText = args.slice(1).join(' ');

    let time = 0;
    if (timeArg.endsWith('s')) {
      time = parseInt(timeArg) * 1000;
    } else if (timeArg.endsWith('m')) {
      time = parseInt(timeArg) * 60000;
    } else if (timeArg.endsWith('h')) {
      time = parseInt(timeArg) * 3600000;
    } else if (timeArg.endsWith('d')) {
      time = parseInt(timeArg) * 86400000;
    } else {
      return message.reply('❌ Nieprawidłowy format czasu! Użyj: 10s, 5m, 2h, 1d');
    }

    if (time < 1000 || time > 2592000000) {
      return message.reply('❌ Czas musi być między 1s a 30 dniami!');
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('⏰ Przypomnienie ustawione!')
      .setDescription(`Przypomnę Ci za **${args[0]}**\n\n📝 "${reminderText}"`)
      .setFooter({ text: `Ustaw: ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });

    if (!client.reminders) client.reminders = new Map();
    
    const reminderId = `${message.author.id}_${Date.now()}`;
    const timeout = setTimeout(async () => {
      const reminderEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('⏰ Przypomnienie!')
        .setDescription(`📝 ${reminderText}`)
        .setFooter({ text: `Przypomnienie od ${args[0]} temu` })
        .setTimestamp();

      try {
        await message.author.send({ embeds: [reminderEmbed] });
      } catch {
        message.channel.send(`${message.author} ⏰ Przypomnienie: ${reminderText}`);
      }
      
      client.reminders.delete(reminderId);
    }, time);

    client.reminders.set(reminderId, {
      userId: message.author.id,
      text: reminderText,
      time: args[0],
      timeout
    });
  },
};
