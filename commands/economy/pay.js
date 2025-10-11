const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '../../data/economy.json');

function getEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}');
  }
  return JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

module.exports = {
  name: 'pay',
  description: 'Przekaż pieniądze innemu użytkownikowi',
  aliases: ['transfer', 'give'],
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) {
      return message.reply('❌ Oznacz użytkownika któremu chcesz przekazać pieniądze!');
    }

    if (target.id === message.author.id) {
      return message.reply('❌ Nie możesz przekazać pieniędzy samemu sobie!');
    }

    if (target.bot) {
      return message.reply('❌ Nie możesz przekazać pieniędzy botowi!');
    }

    if (!amount || amount <= 0 || isNaN(amount)) {
      return message.reply('❌ Podaj poprawną kwotę do przekazania!');
    }

    const economy = getEconomy();
    
    if (!economy[message.author.id]) {
      economy[message.author.id] = { balance: 0, bank: 0, inventory: [] };
    }
    if (!economy[target.id]) {
      economy[target.id] = { balance: 0, bank: 0, inventory: [] };
    }

    const sender = economy[message.author.id];

    if (sender.balance < amount) {
      return message.reply(`❌ Nie masz wystarczająco pieniędzy! Masz ${sender.balance} 🪙`);
    }

    sender.balance -= amount;
    economy[target.id].balance += amount;

    fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#4CAF50')
      .setTitle('💸 Transfer wykonany!')
      .setDescription(`${message.author} przekazał **${amount} 🪙** dla ${target}`)
      .addFields(
        { name: 'Twoje saldo', value: `${sender.balance} 🪙`, inline: true },
        { name: 'Saldo odbiorcy', value: `${economy[target.id].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
