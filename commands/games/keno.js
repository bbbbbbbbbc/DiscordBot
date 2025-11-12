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
    .setName('keno')
    .setDescription('Zagraj w Keno! 🎲')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(20)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 20;

    if (bet < 20) {
      const msg = '❌ Minimalna stawka to 20 monet!';
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

    const playerNumbers = Array.from({length: 10}, () => Math.floor(Math.random() * 80) + 1).sort((a, b) => a - b);
    const drawnNumbers = Array.from({length: 20}, () => Math.floor(Math.random() * 80) + 1);
    
    const matches = playerNumbers.filter(num => drawnNumbers.includes(num)).length;
    
    const payoutTable = {
      10: 100, 9: 50, 8: 20, 7: 10, 6: 5, 5: 3, 4: 2, 3: 1
    };
    
    let winAmount = 0;
    let result = '';
    
    if (payoutTable[matches]) {
      winAmount = bet * payoutTable[matches];
      result = `🎉 Trafiłeś ${matches} liczb!`;
    } else {
      winAmount = -bet;
      result = `😢 Tylko ${matches} trafienia!`;
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎲 Keno')
      .setDescription(`**Twoje liczby:**\n${playerNumbers.join(', ')}\n\n**Trafienia:** ${matches}/10\n${result}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
