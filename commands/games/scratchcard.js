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
    .setName('scratchcard')
    .setDescription('Kup zdrapkę! 🎫')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu (50, 100, lub 200)')
        .setRequired(true)
        .addChoices(
          { name: '50 monet', value: 50 },
          { name: '100 monet', value: 100 },
          { name: '200 monet', value: 200 }
        )
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 50;

    if (![50, 100, 200].includes(bet)) {
      const msg = '❌ Wybierz stawkę: 50, 100 lub 200 monet!';
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

    const symbols = ['💎', '🍀', '⭐', '🎰', '🔔', '🍒'];
    const card = Array.from({length: 9}, () => symbols[Math.floor(Math.random() * symbols.length)]);
    
    const symbolCounts = {};
    card.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(symbolCounts));
    const winningSymbol = Object.keys(symbolCounts).find(s => symbolCounts[s] === maxCount);
    
    let winAmount = 0;
    let result = '';
    
    if (maxCount >= 5) {
      winAmount = bet * 10;
      result = `🏆 JACKPOT! 5+ symboli ${winningSymbol}!`;
    } else if (maxCount === 4) {
      winAmount = bet * 5;
      result = `💰 4 symbole ${winningSymbol}!`;
    } else if (maxCount === 3) {
      winAmount = bet * 2;
      result = `✨ 3 symbole ${winningSymbol}!`;
    } else {
      winAmount = -bet;
      result = '😢 Nic nie wygrałeś!';
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const cardDisplay = `${card[0]} ${card[1]} ${card[2]}\n${card[3]} ${card[4]} ${card[5]}\n${card[6]} ${card[7]} ${card[8]}`;

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎫 Zdrapka')
      .setDescription(`**Twoja karta:**\n${cardDisplay}\n\n${result}`)
      .addFields(
        { name: '💰 Koszt', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
