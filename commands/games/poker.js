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

const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function drawCard() {
  return {
    suit: suits[Math.floor(Math.random() * suits.length)],
    value: values[Math.floor(Math.random() * values.length)]
  };
}

function getHandValue(cards) {
  const valueMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  const values = cards.map(c => valueMap[c.value]);
  values.sort((a, b) => b - a);
  
  const valueCounts = {};
  values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  
  const isFlush = cards.every(c => c.suit === cards[0].suit);
  const isStraight = values.every((v, i) => i === 0 || v === values[i-1] - 1);
  
  if (isStraight && isFlush) return { rank: 9, name: 'Poker!' };
  if (counts[0] === 4) return { rank: 8, name: 'Kareta' };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 7, name: 'Full' };
  if (isFlush) return { rank: 6, name: 'Kolor' };
  if (isStraight) return { rank: 5, name: 'Strit' };
  if (counts[0] === 3) return { rank: 4, name: 'Trójka' };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 3, name: 'Dwie pary' };
  if (counts[0] === 2) return { rank: 2, name: 'Para' };
  return { rank: 1, name: 'Wysoka karta' };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poker')
    .setDescription('Zagraj w pokera!')
    .addIntegerOption(option =>
      option.setName('stawka')
        .setDescription('Kwota zakładu')
        .setRequired(true)
        .setMinValue(50)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const userId = interaction.user.id;
    const bet = isSlash ? interaction.options.getInteger('stawka') : 50;

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

    const playerCards = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];
    const dealerCards = [drawCard(), drawCard(), drawCard(), drawCard(), drawCard()];

    const playerHand = getHandValue(playerCards);
    const dealerHand = getHandValue(dealerCards);

    let winAmount = 0;
    let result = '';

    if (playerHand.rank > dealerHand.rank) {
      winAmount = bet * 2;
      result = '🎉 Wygrałeś!';
    } else if (playerHand.rank < dealerHand.rank) {
      winAmount = -bet;
      result = '😢 Przegrałeś!';
    } else {
      result = '🤝 Remis!';
    }

    economy[userId].balance = Math.max(0, economy[userId].balance + winAmount);
    saveEconomy(economy);

    const playerCardsStr = playerCards.map(c => `${c.value}${c.suit}`).join(' ');
    const dealerCardsStr = dealerCards.map(c => `${c.value}${c.suit}`).join(' ');

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? '#00FF00' : winAmount < 0 ? '#FF0000' : '#FFFF00')
      .setTitle('🃏 Poker')
      .addFields(
        { name: '👤 Twoje karty', value: `${playerCardsStr}\n**${playerHand.name}**`, inline: false },
        { name: '🤖 Karty dealera', value: `${dealerCardsStr}\n**${dealerHand.name}**`, inline: false },
        { name: '📊 Wynik', value: result, inline: false },
        { name: '💰 Stawka', value: `${bet} 🪙`, inline: true },
        { name: winAmount > 0 ? '✅ Wygrana' : winAmount < 0 ? '❌ Strata' : '🤝 Remis', value: `${Math.abs(winAmount)} 🪙`, inline: true },
        { name: '💼 Saldo', value: `${economy[userId].balance} 🪙`, inline: true }
      )
      .setTimestamp();

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
