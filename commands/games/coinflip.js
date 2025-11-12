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
    .setName('coinflip')
    .setDescription('Rzuć monetą i zgadnij!')
    .addStringOption(option =>
      option.setName('wybor')
        .setDescription('Orzeł czy reszka?')
        .setRequired(true)
        .addChoices(
          { name: 'Orzeł', value: 'heads' },
          { name: 'Reszka', value: 'tails' }
        )
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
    const choice = isSlash ? interaction.options.getString('wybor') : 'heads';
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 10;

    if (!bet || bet <= 0 || isNaN(bet)) {
      const msg = '❌ Podaj poprawną stawkę!';
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

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === choice;
    const winAmount = won ? bet : -bet;

    economy[userId].balance = Math.max(0, economy[userId].balance + winAmount);
    saveEconomy(economy);

    const resultEmoji = result === 'heads' ? '🦅' : '🏛️';
    const choiceEmoji = choice === 'heads' ? '🦅' : '🏛️';

    const embed = new EmbedBuilder()
      .setColor(won ? '#00FF00' : '#FF0000')
      .setTitle('🪙 Rzut Monetą')
      .setDescription(`Wybrałeś: ${choiceEmoji} ${choice === 'heads' ? 'Orzeł' : 'Reszka'}\nWynik: ${resultEmoji} ${result === 'heads' ? 'Orzeł' : 'Reszka'}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: won ? '✅ Wygrałeś' : '❌ Przegrałeś', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
