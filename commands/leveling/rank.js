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

function getXpForLevel(level) {
  return Math.pow(level / 0.1, 2);
}

module.exports = {
  name: 'rank',
  description: 'Sprawdź swój poziom i XP',
  aliases: ['level', 'lvl', 'poziom'],
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const levels = getLevels();
    
    if (!levels[target.id]) {
      levels[target.id] = { xp: 0, level: 0, messages: 0 };
      fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2));
    }

    const userData = levels[target.id];
    const currentLevel = getLevel(userData.xp);
    const xpForCurrentLevel = getXpForLevel(currentLevel);
    const xpForNextLevel = getXpForLevel(currentLevel + 1);
    const xpProgress = userData.xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.floor((xpProgress / xpNeeded) * 100);

    const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle(`📊 Poziom ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '⭐ Poziom', value: `${currentLevel}`, inline: true },
        { name: '✨ XP', value: `${userData.xp}`, inline: true },
        { name: '💬 Wiadomości', value: `${userData.messages || 0}`, inline: true },
        { name: '📈 Postęp do następnego poziomu', value: `${progressBar} ${progressPercent}%\n${xpProgress}/${xpNeeded} XP` }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
