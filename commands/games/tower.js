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
    .setName('tower')
    .setDescription('Wspinaj się na wieżę! 🗼')
    .addIntegerOption(option =>
      option.setName('poziom')
        .setDescription('Do jakiego poziomu chcesz dojść? (1-10)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(15)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const targetLevel = isSlash ? interaction.options.getInteger('poziom') : parseInt(interaction.content.split(' ')[1]) || 5;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[2]) || 15;

    if (targetLevel < 1 || targetLevel > 10) {
      const msg = '❌ Wybierz poziom od 1 do 10!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (bet < 15) {
      const msg = '❌ Minimalna stawka to 15 monet!';
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

    let currentLevel = 0;
    let failed = false;
    const multipliers = [1.2, 1.4, 1.7, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10.0];
    
    for (let i = 0; i < targetLevel; i++) {
      const difficulty = 0.7 - (i * 0.05);
      if (Math.random() > difficulty) {
        failed = true;
        break;
      }
      currentLevel++;
    }

    let winAmount = 0;
    let result = '';
    
    if (failed) {
      winAmount = -bet;
      result = `💔 Spadłeś na poziomie ${currentLevel + 1}!`;
    } else {
      const multiplier = multipliers[targetLevel - 1];
      winAmount = Math.floor(bet * multiplier) - bet;
      result = `🏆 Dotarłeś na poziom ${targetLevel}!`;
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const towerDisplay = Array.from({length: 10}, (_, i) => {
      const level = 10 - i;
      if (level === currentLevel && !failed) {
        return `${level}. 🟢 <- DOTARŁEŚ!`;
      } else if (level === currentLevel + 1 && failed) {
        return `${level}. 💥 <- UPADEK!`;
      } else if (level <= currentLevel) {
        return `${level}. ✅`;
      } else {
        return `${level}. ⬜`;
      }
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(failed ? '#FF0000' : '#00FF00')
      .setTitle('🗼 Wieża')
      .setDescription(`**Cel:** Poziom ${targetLevel}\n\n${towerDisplay}\n\n${result}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: failed ? '❌ Strata' : '✅ Wygrana', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
