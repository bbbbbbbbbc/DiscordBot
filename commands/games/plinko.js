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
    .setName('plinko')
    .setDescription('Upuść kulkę w Plinko! 🎯')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(10)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 10;

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

    const multipliers = [0, 0.5, 1, 2, 3, 5, 3, 2, 1, 0.5, 0];
    const weights = [10, 15, 20, 15, 12, 8, 12, 15, 20, 15, 10];
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let position = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        position = i;
        break;
      }
    }

    const multiplier = multipliers[position];
    const winAmount = Math.floor(bet * multiplier) - bet;

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const displayMultipliers = multipliers.map((m, i) => 
      i === position ? `[**${m}x**]` : `${m}x`
    ).join(' ');

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : winAmount < 0 ? '#FF0000' : '#FFFF00')
      .setTitle('🎯 Plinko')
      .setDescription(`Kulka wpadła do slotu:\n\n${displayMultipliers}\n\n**Mnożnik:** ${multiplier}x`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : winAmount < 0 ? '❌ Strata' : '➖ Zwrot', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
