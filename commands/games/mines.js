const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    .setName('mines')
    .setDescription('Gra w miny - unikaj bomb!')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(20)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : 20;

    const economy = getEconomy();
    
    if (!economy[userId]) {
      economy[userId] = { balance: 100, bank: 0, inventory: [] };
    }

    if (economy[userId].balance < bet) {
      const msg = `❌ Nie masz wystarczająco monet! Masz: ${economy[userId].balance} 🪙`;
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const gridSize = 16;
    const mineCount = 5;
    const mines = new Set();
    
    while (mines.size < mineCount) {
      mines.add(Math.floor(Math.random() * gridSize));
    }

    const revealed = Math.floor(Math.random() * gridSize);
    
    if (mines.has(revealed)) {
      economy[userId].balance -= bet;
      saveEconomy(economy);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💣 Mines - BOOM!')
        .setDescription(`💥 Trafiłeś na minę przy pierwszym ruchu!\n\n❌ Przegrałeś ${bet} 🪙`)
        .addFields(
          { name: '💼 Nowe saldo', value: `${economy[userId].balance} 🪙`, inline: true }
        )
        .setTimestamp();

      return isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
    }

    const safeSpots = 1;
    const multiplier = 1 + (safeSpots * 0.25);
    const winAmount = Math.floor(bet * multiplier);

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const grid = Array(gridSize).fill('⬛').map((_, i) => {
      if (i === revealed) return '✅';
      if (mines.has(i)) return '💣';
      return '⬛';
    });

    const gridDisplay = [];
    for (let i = 0; i < 4; i++) {
      gridDisplay.push(grid.slice(i * 4, i * 4 + 4).join(' '));
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('💎 Mines - Wygrana!')
      .setDescription(`${gridDisplay.join('\n')}\n\n✅ Trafiłeś bezpieczne pole!\n🎉 Wygrałeś ${winAmount} 🪙 (${multiplier.toFixed(2)}x)`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: '✅ Wygrana', value: `${winAmount} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setFooter({ text: `💣 Liczba min: ${mineCount}` })
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
