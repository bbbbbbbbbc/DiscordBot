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
    .setName('limbo')
    .setDescription('Gra Limbo - ustaw mnożnik! 📊')
    .addNumberOption(option =>
      option.setName('mnoznik')
        .setDescription('Docelowy mnożnik (1.1 - 10.0)')
        .setRequired(true)
        .setMinValue(1.1)
        .setMaxValue(10.0)
    )
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(10)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const targetMultiplier = isSlash ? interaction.options.getNumber('mnoznik') : parseFloat(interaction.content.split(' ')[1]) || 2.0;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[2]) || 10;

    if (targetMultiplier < 1.1 || targetMultiplier > 10.0) {
      const msg = '❌ Mnożnik musi być między 1.1 a 10.0!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (bet < 10) {
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

    const resultMultiplier = (Math.random() * 9 + 1).toFixed(2);
    const won = parseFloat(resultMultiplier) >= targetMultiplier;
    
    let winAmount = 0;
    if (won) {
      winAmount = Math.floor(bet * targetMultiplier) - bet;
    } else {
      winAmount = -bet;
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(won ? '#00FF00' : '#FF0000')
      .setTitle('📊 Limbo')
      .setDescription(`**Twój cel:** ${targetMultiplier.toFixed(2)}x\n**Wynik:** ${resultMultiplier}x\n\n${won ? '✅ Wygrałeś!' : '❌ Przegrałeś!'}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: won ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
