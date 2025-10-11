const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../../data/levels.json');

function getLevels() {
  if (!fs.existsSync(levelsPath)) {
    fs.writeFileSync(levelsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
}

function getLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
  name: 'levels',
  description: 'Ranking poziomów użytkowników',
  aliases: ['lvlboard', 'toplvl'],
  async execute(message, args, client) {
    const levels = getLevels();
    
    const sorted = Object.entries(levels)
      .map(([userId, data]) => ({
        userId,
        xp: data.xp || 0,
        level: getLevel(data.xp || 0)
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    if (sorted.length === 0) {
      return message.reply('❌ Brak danych poziomów!');
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🏆 Ranking Poziomów')
      .setDescription('Top 10 użytkowników z najwyższym poziomem')
      .setTimestamp();

    const leaderboardText = await Promise.all(
      sorted.map(async (entry, index) => {
        try {
          const user = await client.users.fetch(entry.userId);
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          return `${medal} **${user.username}** - Poziom ${entry.level} (${entry.xp} XP)`;
        } catch {
          return `${index + 1}. Nieznany użytkownik - Poziom ${entry.level} (${entry.xp} XP)`;
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
