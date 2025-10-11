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
  name: 'work',
  description: 'Pracuj aby zarobić pieniądze',
  aliases: ['praca'],
  async execute(message, args, client) {
    const economy = getEconomy();
    
    if (!economy[message.author.id]) {
      economy[message.author.id] = { balance: 0, bank: 0, inventory: [], lastWork: 0 };
    }

    const userData = economy[message.author.id];
    const now = Date.now();
    const cooldown = 3600000;

    if (userData.lastWork && now - userData.lastWork < cooldown) {
      const timeLeft = cooldown - (now - userData.lastWork);
      const minutes = Math.floor(timeLeft / 60000);

      return message.reply(`⏰ Jesteś zmęczony! Odpocznij ${minutes} minut`);
    }

    const jobs = [
      { name: 'Programista', emoji: '💻', min: 300, max: 800 },
      { name: 'Lekarz', emoji: '⚕️', min: 400, max: 900 },
      { name: 'Kurier', emoji: '🚚', min: 200, max: 500 },
      { name: 'Nauczyciel', emoji: '👨‍🏫', min: 250, max: 600 },
      { name: 'Sprzedawca', emoji: '🛒', min: 150, max: 400 },
      { name: 'Mechanik', emoji: '🔧', min: 300, max: 700 },
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    userData.balance += earned;
    userData.lastWork = now;

    fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#4CAF50')
      .setTitle(`${job.emoji} Praca: ${job.name}`)
      .setDescription(`Pracowałeś jako ${job.name} i zarobiłeś **${earned} 🪙**!`)
      .addFields({ name: '💰 Nowe saldo', value: `${userData.balance} 🪙` })
      .setFooter({ text: 'Możesz pracować znowu za godzinę!' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
