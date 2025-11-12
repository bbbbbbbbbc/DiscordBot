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
    .setName('lottery')
    .setDescription('Zagraj w loterię! 🎟️')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu (50-500 monet)')
        .setRequired(true)
        .setMinValue(50)
        .setMaxValue(500)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 50;

    if (bet < 50 || bet > 500) {
      const msg = '❌ Stawka musi być między 50 a 500 monet!';
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

    const playerNumbers = Array.from({length: 6}, () => Math.floor(Math.random() * 49) + 1).sort((a, b) => a - b);
    const winningNumbers = Array.from({length: 6}, () => Math.floor(Math.random() * 49) + 1).sort((a, b) => a - b);
    
    const matches = playerNumbers.filter(num => winningNumbers.includes(num)).length;
    
    let winAmount = 0;
    let result = '';
    
    if (matches === 6) {
      winAmount = bet * 100;
      result = '🎉 JACKPOT! Wszystkie 6 liczb!';
    } else if (matches === 5) {
      winAmount = bet * 20;
      result = '💰 Świetnie! 5 liczb!';
    } else if (matches === 4) {
      winAmount = bet * 5;
      result = '✨ Dobrze! 4 liczby!';
    } else if (matches === 3) {
      winAmount = bet * 2;
      result = '👍 3 liczby - mała wygrana!';
    } else {
      winAmount = -bet;
      result = '😢 Nic nie wygrałeś tym razem!';
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎟️ Loteria')
      .setDescription(`**Twoje liczby:** ${playerNumbers.join(', ')}\n**Wylosowane:** ${winningNumbers.join(', ')}\n\n**Trafione:** ${matches}/6\n${result}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
