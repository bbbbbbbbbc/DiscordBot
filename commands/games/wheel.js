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
    .setName('wheel')
    .setDescription('Zakręć kołem fortuny! 🎡')
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

    const prizes = [
      { name: 'BANKRUT', multiplier: -1, emoji: '💥', chance: 15 },
      { name: 'Nic', multiplier: 0, emoji: '❌', chance: 25 },
      { name: 'x0.5', multiplier: 0.5, emoji: '😐', chance: 20 },
      { name: 'x1', multiplier: 1, emoji: '🔄', chance: 15 },
      { name: 'x2', multiplier: 2, emoji: '✨', chance: 12 },
      { name: 'x5', multiplier: 5, emoji: '💰', chance: 8 },
      { name: 'x10', multiplier: 10, emoji: '🎉', chance: 4 },
      { name: 'JACKPOT', multiplier: 20, emoji: '🏆', chance: 1 }
    ];

    const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);
    let random = Math.random() * totalChance;
    let selectedPrize = prizes[0];
    
    for (const prize of prizes) {
      random -= prize.chance;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    let winAmount = 0;
    if (selectedPrize.multiplier === -1) {
      winAmount = -bet;
    } else if (selectedPrize.multiplier === 0) {
      winAmount = 0;
    } else {
      winAmount = Math.floor(bet * selectedPrize.multiplier) - bet;
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : winAmount < 0 ? '#FF0000' : '#FFFF00')
      .setTitle('🎡 Koło Fortuny')
      .setDescription(`**Koło zatrzymało się na:**\n${selectedPrize.emoji} **${selectedPrize.name}** ${selectedPrize.emoji}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : winAmount < 0 ? '❌ Strata' : '➖ Zwrot', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
