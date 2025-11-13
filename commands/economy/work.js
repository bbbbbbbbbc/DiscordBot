const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '../../data/economy.json');
const settingsPath = path.join(__dirname, '../../data/economySettings.json');

function getEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}');
  }
  return JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

function getGuildSettings(guildId) {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '{}');
  }
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  if (!settings[guildId]) {
    settings[guildId] = {
      work: { min: 150, max: 900 },
      daily: { min: 500, max: 1000 }
    };
  }
  return settings[guildId];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Pracuj aby zarobić pieniądze'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    
    const economy = getEconomy();
    
    if (!economy[author.id]) {
      economy[author.id] = { balance: 0, bank: 0, inventory: [], lastWork: 0 };
    }

    const userData = economy[author.id];
    const now = Date.now();
    const cooldown = 3600000;

    if (userData.lastWork && now - userData.lastWork < cooldown) {
      const timeLeft = cooldown - (now - userData.lastWork);
      const minutes = Math.floor(timeLeft / 60000);

      const message = `⏰ Jesteś zmęczony! Odpocznij ${minutes} minut`;
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const guildSettings = getGuildSettings(interaction.guild.id);
    const { min: minEarn, max: maxEarn } = guildSettings.work;

    const jobs = [
      { name: 'Programista', emoji: '💻' },
      { name: 'Lekarz', emoji: '⚕️' },
      { name: 'Kurier', emoji: '🚚' },
      { name: 'Nauczyciel', emoji: '👨‍🏫' },
      { name: 'Sprzedawca', emoji: '🛒' },
      { name: 'Mechanik', emoji: '🔧' },
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earned = Math.floor(Math.random() * (maxEarn - minEarn + 1)) + minEarn;

    userData.balance = Math.max(0, userData.balance + earned);
    userData.lastWork = now;

    fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#4CAF50')
      .setTitle(`${job.emoji} Praca: ${job.name}`)
      .setDescription(`Pracowałeś jako ${job.name} i zarobiłeś **${earned} 🪙**!`)
      .addFields({ name: '💰 Nowe saldo', value: `${userData.balance} 🪙` })
      .setFooter({ text: 'Możesz pracować znowu za godzinę!' })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
