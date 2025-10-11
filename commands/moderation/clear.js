const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Usuwa określoną liczbę wiadomości',
  aliases: ['purge'],
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Nie masz uprawnień do usuwania wiadomości!');
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Podaj liczbę od 1 do 100 wiadomości do usunięcia!');
    }

    try {
      await message.channel.bulkDelete(amount + 1, true);
      const reply = await message.channel.send(`✅ Usunięto ${amount} wiadomości!`);
      setTimeout(() => reply.delete(), 3000);
    } catch (error) {
      console.error(error);
      message.reply('❌ Nie udało się usunąć wiadomości! (Wiadomości starsze niż 14 dni nie mogą być usunięte)');
    }
  },
};
