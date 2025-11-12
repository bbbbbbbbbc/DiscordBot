const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '../../data/economy.json');

function getEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}');
  }
  return JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

function saveEconomy(economy) {
  fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yahtzee')
    .setDescription('Zagraj w Yahtzee! 🎲')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(25)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 25;

    if (bet < 25) {
      const msg = '❌ Minimalna stawka to 25 monet!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const economy = getEconomy();
    
    if (!economy[userId]) {
      economy[userId] = { balance: 100, bank: 0, inventory: [] };
    }

    if (economy[userId].balance < bet) {
      const msg = `❌ Nie masz wystarczająco monet! Masz: ${economy[userId].balance} 🪙`;
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const dice = Array.from({length: 5}, () => Math.floor(Math.random() * 6) + 1).sort();
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
    const countValues = Object.values(counts).sort((a, b) => b - a);
    
    let winAmount = 0;
    let result = '';
    
    if (countValues[0] === 5) {
      winAmount = bet * 50;
      result = '🏆 YAHTZEE! Wszystkie pięć!';
    } else if (countValues[0] === 4) {
      winAmount = bet * 10;
      result = '💎 Cztery takie same!';
    } else if (countValues[0] === 3 && countValues[1] === 2) {
      winAmount = bet * 8;
      result = '🏠 Full House!';
    } else if (countValues[0] === 3) {
      winAmount = bet * 5;
      result = '🎯 Trzy takie same!';
    } else if (countValues[0] === 2 && countValues[1] === 2) {
      winAmount = bet * 3;
      result = '👥 Dwie pary!';
    } else if (dice[4] - dice[0] === 4 && new Set(dice).size === 5) {
      winAmount = bet * 7;
      result = '📊 Mały street!';
    } else if (countValues[0] === 2) {
      winAmount = bet;
      result = '🎲 Jedna para - zwrot!';
    } else {
      winAmount = -bet;
      result = '😢 Nic specjalnego!';
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const diceDisplay = dice.map(d => diceEmojis[d-1]).join(' ');

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎲 Yahtzee')
      .setDescription(`**Twój rzut:**\n${diceDisplay}\n\n${result}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
