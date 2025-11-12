const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
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
  data: new SlashCommandBuilder()
    .setName('levels')
    .setDescription('Ranking poziomów użytkowników'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
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
      const message = '❌ Brak danych poziomów!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
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

    const userRank = sorted.findIndex(entry => entry.userId === author.id);
    if (userRank !== -1) {
      embed.setFooter({ text: `Twoja pozycja: #${userRank + 1}` });
    }

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
