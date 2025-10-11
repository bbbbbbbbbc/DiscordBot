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
  name: 'balance',
  description: 'Sprawdź swoje saldo',
  aliases: ['bal', 'money', 'cash'],
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const economy = getEconomy();
    
    if (!economy[target.id]) {
      economy[target.id] = { balance: 0, bank: 0, inventory: [] };
      fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));
    }

    const userData = economy[target.id];
    const total = userData.balance + userData.bank;

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`💰 Portfel ${target.username}`)
      .addFields(
        { name: '💵 Gotówka', value: `${userData.balance} 🪙`, inline: true },
        { name: '🏦 Bank', value: `${userData.bank} 🪙`, inline: true },
        { name: '💎 Razem', value: `${total} 🪙`, inline: true }
      )
      .setThumbnail(target.displayAvatarURL())
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
