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
    .setName('crash')
    .setDescription('Gra Crash - wyjdź przed crashem!')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(20)
    )
    .addNumberOption(option =>
      option.setName('mnoznik')
        .setDescription('Kiedy chcesz wyjść? (np. 1.5, 2.0, 3.5)')
        .setRequired(true)
        .setMinValue(1.1)
        .setMaxValue(10.0)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : 20;
    const cashout = isSlash ? interaction.options.getNumber('mnoznik') : 2.0;

    const economy = getEconomy();
    
    if (!economy[userId]) {
      economy[userId] = { balance: 100, bank: 0, inventory: [] };
    }

    if (economy[userId].balance < bet) {
      const msg = `❌ Nie masz wystarczająco monet! Masz: ${economy[userId].balance} 🪙`;
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const crashPoint = parseFloat((Math.pow(Math.random(), 2) * 10).toFixed(2));
    const won = cashout <= crashPoint;

    let winAmount = 0;
    let result = '';

    if (won) {
      winAmount = Math.floor(bet * cashout);
      result = `🎉 Wygrałeś! Wyszedłeś na ${cashout}x`;
    } else {
      winAmount = -bet;
      result = `💥 Crash na ${crashPoint}x! Przegrałeś!`;
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(won ? '#00FF00' : '#FF0000')
      .setTitle('🚀 Crash Game')
      .setDescription(`${result}\n\n📊 Crash na: **${crashPoint}x**\n🎯 Twój wybór: **${cashout}x**`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: won ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
