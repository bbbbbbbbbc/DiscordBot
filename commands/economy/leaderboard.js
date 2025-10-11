const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '../../data/economy.json');

function getEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}');
  }
  return JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

module.exports = {
  name: 'leaderboard',
  description: 'Ranking najbogatszych użytkowników',
  aliases: ['lb', 'top', 'ranking'],
  async execute(message, args, client) {
    const economy = getEconomy();
    
    const sorted = Object.entries(economy)
      .map(([userId, data]) => ({
        userId,
        total: (data.balance || 0) + (data.bank || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    if (sorted.length === 0) {
      return message.reply('❌ Brak danych ekonomicznych!');
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Ranking Najbogatszych')
      .setDescription('Top 10 użytkowników z największą ilością pieniędzy')
      .setTimestamp();

    const leaderboardText = await Promise.all(
      sorted.map(async (entry, index) => {
        try {
          const user = await client.users.fetch(entry.userId);
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          return `${medal} **${user.username}** - ${entry.total} 🪙`;
        } catch {
          return `${index + 1}. Nieznany użytkownik - ${entry.total} 🪙`;
        }
      })
    );

    embed.setDescription(leaderboardText.join('\n'));

    const userRank = sorted.findIndex(entry => entry.userId === message.author.id);
    if (userRank !== -1) {
      embed.setFooter({ text: `Twoja pozycja: #${userRank + 1}` });
    }

    message.reply({ embeds: [embed] });
  },
};
