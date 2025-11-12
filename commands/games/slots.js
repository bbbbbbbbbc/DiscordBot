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
    .setName('slots')
    .setDescription('Zagraj w automaty! 🎰')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(10)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]);

    if (!bet || bet <= 0 || isNaN(bet) || bet < 10) {
      const msg = '❌ Minimalna stawka to 10 monet!';
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

    const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
    const slots = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];

    let winAmount = 0;
    let result = '';

    if (slots[0] === slots[1] && slots[1] === slots[2]) {
      if (slots[0] === '7️⃣') {
        winAmount = bet * 10;
        result = '💰 JACKPOT! Trzy siódemki!';
      } else if (slots[0] === '💎') {
        winAmount = bet * 5;
        result = '💎 Diamenty! Świetna wygrana!';
      } else {
        winAmount = bet * 3;
        result = '🎉 Trzy takie same!';
      }
    } else if (slots[0] === slots[1] || slots[1] === slots[2] || slots[0] === slots[2]) {
      winAmount = bet;
      result = '✨ Dwa takie same - zwrot stawki!';
    } else {
      winAmount = -bet;
      result = '😢 Nic nie wygrałeś!';
    }

    economy[userId].balance = Math.max(0, economy[userId].balance + winAmount);
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎰 Automaty')
      .setDescription(`${slots.join(' | ')}\n\n${result}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
