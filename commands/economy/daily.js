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
  name: 'daily',
  description: 'Odbierz codzienną nagrodę',
  aliases: ['dzienna'],
  async execute(message, args, client) {
    const economy = getEconomy();
    
    if (!economy[message.author.id]) {
      economy[message.author.id] = { balance: 0, bank: 0, inventory: [], lastDaily: 0 };
    }

    const userData = economy[message.author.id];
    const now = Date.now();
    const oneDay = 86400000;

    if (userData.lastDaily && now - userData.lastDaily < oneDay) {
      const timeLeft = oneDay - (now - userData.lastDaily);
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);

      return message.reply(`⏰ Już odebrałeś dzienną nagrodę! Następna za ${hours}h ${minutes}min`);
    }

    const reward = Math.floor(Math.random() * 500) + 500;
    userData.balance += reward;
    userData.lastDaily = now;

    fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎁 Codzienna Nagroda!')
      .setDescription(`Otrzymałeś **${reward} 🪙**!`)
      .addFields({ name: '💰 Nowe saldo', value: `${userData.balance} 🪙` })
      .setFooter({ text: 'Wróć jutro po więcej!' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
