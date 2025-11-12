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

const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getCard() {
  return {
    value: values[Math.floor(Math.random() * values.length)],
    suit: suits[Math.floor(Math.random() * suits.length)]
  };
}

function getCardValue(card) {
  return values.indexOf(card.value);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('highlow')
    .setDescription('Zgadnij czy następna karta będzie wyższa czy niższa! 🃏')
    .addStringOption(option =>
      option.setName('wybor')
        .setDescription('Wyższa czy niższa?')
        .setRequired(true)
        .addChoices(
          { name: 'Wyższa ⬆️', value: 'higher' },
          { name: 'Niższa ⬇️', value: 'lower' }
        )
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
    const choice = isSlash ? interaction.options.getString('wybor') : 'higher';
    const bet = isSlash ? interaction.options.getInteger('stawka') : parseInt(interaction.content.split(' ')[1]) || 15;

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

    const currentCard = getCard();
    const nextCard = getCard();
    
    const currentValue = getCardValue(currentCard);
    const nextValue = getCardValue(nextCard);
    
    let won = false;
    if (choice === 'higher' && nextValue > currentValue) {
      won = true;
    } else if (choice === 'lower' && nextValue < currentValue) {
      won = true;
    } else if (nextValue === currentValue) {
      won = false;
    }

    const winAmount = won ? bet : -bet;

    economy[userId].balance += winAmount;
    saveEconomy(economy);

    const embed = new EmbedBuilder()
      .setColor(won ? '#00FF00' : '#FF0000')
      .setTitle('🃏 High-Low')
      .setDescription(`**Aktualna karta:** ${currentCard.value}${currentCard.suit}\n**Następna karta:** ${nextCard.value}${nextCard.suit}\n\n**Twój wybór:** ${choice === 'higher' ? 'Wyższa ⬆️' : 'Niższa ⬇️'}\n\n${won ? '✅ Dobrze!' : '❌ Źle!'}`)
      .addFields(
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: won ? '✅ Wygrana' : '❌ Strata', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
