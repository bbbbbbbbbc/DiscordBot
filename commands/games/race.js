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
    .setName('race')
    .setDescription('Postaw na wyścig! 🏇')
    .addIntegerOption(option =>
      option.setName('numer')
        .setDescription('Numer konia (1-5)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(25)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const horseNum = isSlash ? interaction.options.getInteger('numer') : parseInt(interaction.content.split(' ')[1]) || 1;
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[2]) || 25;

    if (horseNum < 1 || horseNum > 5) {
      const msg = '❌ Wybierz konia od 1 do 5!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

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

    const horses = [
      { num: 1, name: 'Thunder', emoji: '🐎', odds: 2 },
      { num: 2, name: 'Lightning', emoji: '⚡', odds: 3 },
      { num: 3, name: 'Storm', emoji: '🌩️', odds: 4 },
      { num: 4, name: 'Blaze', emoji: '🔥', odds: 5 },
      { num: 5, name: 'Shadow', emoji: '🌑', odds: 7 }
    ];

    const weights = [35, 28, 20, 12, 5];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let winner = 1;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        winner = i + 1;
        break;
      }
    }

    const won = winner === horseNum;
    const winningHorse = horses[winner - 1];
    const chosenHorse = horses[horseNum - 1];
    
    let winAmount = 0;
    if (won) {
      winAmount = bet * chosenHorse.odds;
    } else {
      winAmount = -bet;
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const raceDisplay = horses.map((h, i) => {
      const position = winner === h.num ? '🏆' : Math.floor(Math.random() * 3) + 2;
      return `${h.emoji} **Koń ${h.num}** (${h.name}) - ${winner === h.num ? '**ZWYCIĘZCA!**' : 'miejsce ' + position}`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(won ? '#00FF00' : '#FF0000')
      .setTitle('🏇 Wyścig Koni')
      .setDescription(`**Twój koń:** ${chosenHorse.emoji} Koń ${horseNum} (${chosenHorse.name})\n\n**Wyniki:**\n${raceDisplay}\n\n${won ? '🎉 Twój koń wygrał!' : '😢 Twój koń nie wygrał!'}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: won ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
