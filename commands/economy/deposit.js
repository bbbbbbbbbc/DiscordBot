const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

function saveEconomy(economy) {
  fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));
}

function getGuildSettings(guildId) {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '{}');
  }
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  if (!settings[guildId]) {
    settings[guildId] = {
      work: { min: 150, max: 900 },
      daily: { min: 500, max: 1000 },
      bank: { limit: 100000 }
    };
  }
  return settings[guildId];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Wpłać pieniądze do banku')
    .addIntegerOption(option =>
      option.setName('kwota')
        .setDescription('Kwota do wpłacenia (lub "all" dla wszystkiego)')
        .setRequired(true)
        .setMinValue(1)
    ),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const amount = interaction.options.getInteger('kwota');
      
      const economy = getEconomy();

      if (!economy[userId]) {
        economy[userId] = { balance: 100, bank: 0, inventory: [] };
      }

      if (amount > economy[userId].balance) {
        return await interaction.reply({ 
          content: `❌ Nie masz wystarczająco gotówki! Masz: ${economy[userId].balance} 🪙`, 
          ephemeral: true 
        });
      }

      const guildSettings = getGuildSettings(interaction.guild.id);
      const bankLimit = guildSettings.bank.limit;
      const currentBank = economy[userId].bank || 0;
      
      if (currentBank + amount > bankLimit) {
        const canDeposit = bankLimit - currentBank;
        return await interaction.reply({ 
          content: `❌ Limit banku to ${bankLimit} 🪙! Możesz wpłacić maksymalnie ${canDeposit} 🪙`, 
          ephemeral: true 
        });
      }

      economy[userId].balance = Math.max(0, economy[userId].balance - amount);
      economy[userId].bank = Math.max(0, economy[userId].bank + amount);
      
      saveEconomy(economy);

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('🏦 Wpłata do Banku')
        .setDescription(`Wpłaciłeś **${amount} 🪙** do banku!`)
        .addFields(
          { name: '💵 Gotówka', value: `${economy[userId].balance} 🪙`, inline: true },
          { name: '🏦 Bank', value: `${economy[userId].bank} 🪙`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie deposit:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wpłaty!', ephemeral: true });
    }
  },
};
