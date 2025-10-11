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
  name: 'buy',
  description: 'Kup przedmiot ze sklepu',
  aliases: ['kup'],
  async execute(message, args, client) {
    const shop = [
      { id: 'cookie', name: 'Ciastko', price: 100, emoji: '🍪' },
      { id: 'coffee', name: 'Kawa', price: 150, emoji: '☕' },
      { id: 'pizza', name: 'Pizza', price: 300, emoji: '🍕' },
      { id: 'trophy', name: 'Trofeum', price: 1000, emoji: '🏆' },
      { id: 'crown', name: 'Korona', price: 5000, emoji: '👑' },
      { id: 'gem', name: 'Klejnot', price: 10000, emoji: '💎' },
    ];

    if (!args[0]) {
      return message.reply('❌ Podaj ID przedmiotu! Użyj !shop aby zobaczyć dostępne przedmioty.');
    }

    const item = shop.find(i => i.id === args[0].toLowerCase());
    if (!item) {
      return message.reply('❌ Nie znaleziono przedmiotu o takim ID!');
    }

    const economy = getEconomy();
    if (!economy[message.author.id]) {
      economy[message.author.id] = { balance: 0, bank: 0, inventory: [] };
    }

    const userData = economy[message.author.id];

    if (userData.balance < item.price) {
      return message.reply(`❌ Nie masz wystarczająco pieniędzy! Potrzebujesz ${item.price} 🪙, a masz ${userData.balance} 🪙`);
    }

    userData.balance -= item.price;
    if (!userData.inventory) userData.inventory = [];
    userData.inventory.push({ id: item.id, name: item.name, emoji: item.emoji });

    fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Zakup udany!')
      .setDescription(`Kupiłeś ${item.emoji} **${item.name}** za ${item.price} 🪙`)
      .addFields({ name: '💰 Pozostałe saldo', value: `${userData.balance} 🪙` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
