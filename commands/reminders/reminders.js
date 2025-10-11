const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'reminders',
  description: 'Lista twoich przypomnień',
  aliases: ['myreminders', 'listreminders'],
  async execute(message, args, client) {
    if (!client.reminders || client.reminders.size === 0) {
      return message.reply('❌ Nie masz aktywnych przypomnień!');
    }

    const userReminders = Array.from(client.reminders.entries())
      .filter(([id, reminder]) => reminder.userId === message.author.id);

    if (userReminders.length === 0) {
      return message.reply('❌ Nie masz aktywnych przypomnień!');
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('📋 Twoje Przypomnienia')
      .setDescription(
        userReminders.map(([id, reminder], index) => {
          return `${index + 1}. **${reminder.time}** - ${reminder.text}`;
        }).join('\n\n')
      )
      .setFooter({ text: `Aktywnych przypomnień: ${userReminders.length}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
