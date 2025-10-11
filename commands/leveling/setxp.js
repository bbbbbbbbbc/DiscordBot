const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
  name: 'setxp',
  description: '[ADMIN] Ustaw XP użytkownikowi',
  aliases: ['setexp'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Musisz być administratorem aby użyć tej komendy!');
    }

    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) {
      return message.reply('❌ Oznacz użytkownika!');
    }

    if (!amount || amount < 0 || isNaN(amount)) {
      return message.reply('❌ Podaj poprawną ilość XP!');
    }

    const levels = getLevels();
    
    if (!levels[target.id]) {
      levels[target.id] = { xp: 0, level: 0, messages: 0 };
    }

    const oldXp = levels[target.id].xp;
    const oldLevel = getLevel(oldXp);
    
    levels[target.id].xp = amount;
    const newLevel = getLevel(amount);

    fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⚙️ XP Ustawione!')
      .setDescription(`Ustawiono XP dla ${target}`)
      .addFields(
        { name: 'Stare XP', value: `${oldXp} (Poziom ${oldLevel})`, inline: true },
        { name: 'Nowe XP', value: `${amount} (Poziom ${newLevel})`, inline: true }
      )
      .setFooter({ text: `Zmienione przez ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
