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
    .setName('dice3')
    .setDescription('Rzuć 3 kostkami! 🎲')
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

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const dice3 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2 + dice3;

    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    let winAmount = 0;
    let result = '';
    
    if (dice1 === dice2 && dice2 === dice3) {
      winAmount = bet * 10;
      result = '🏆 TRIPLE! Wszystkie takie same!';
    } else if (dice1 === dice2 || dice2 === dice3 || dice1 === dice3) {
      winAmount = bet * 3;
      result = '🎉 PARA! Dwie takie same!';
    } else if (total >= 15) {
      winAmount = bet * 2;
      result = '✨ Wysoka suma!';
    } else if (total >= 12) {
      winAmount = bet;
      result = '👍 Zwrot stawki!';
    } else {
      winAmount = -bet;
      result = '😢 Za mała suma!';
    }

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎲 Trzy Kostki')
      .setDescription(`**Wyrzucone kostki:**\n${diceEmojis[dice1-1]} ${diceEmojis[dice2-1]} ${diceEmojis[dice3-1]}\n\n**Suma:** ${total}\n${result}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
