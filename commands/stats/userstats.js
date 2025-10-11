const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '../../data/stats.json');

function getStats() {
  if (!fs.existsSync(statsPath)) {
    fs.writeFileSync(statsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
}

module.exports = {
  name: 'userstats',
  description: 'Statystyki użytkownika',
  aliases: ['ustats', 'mystats'],
  async execute(message, args, client) {
    const target = message.mentions.users.first() || message.author;
    const stats = getStats();

    if (!stats[target.id]) {
      stats[target.id] = {
        messages: 0,
        commands: 0,
        voiceTime: 0,
        joinedAt: Date.now()
      };
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    }

    const userData = stats[target.id];
    const member = await message.guild.members.fetch(target.id);

    const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000);
    const createdTimestamp = Math.floor(target.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`📈 Statystyki: ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '💬 Wiadomości', value: `${userData.messages || 0}`, inline: true },
        { name: '⚙️ Komendy', value: `${userData.commands || 0}`, inline: true },
        { name: '🎤 Czas głosowy', value: `${Math.floor((userData.voiceTime || 0) / 60)}min`, inline: true },
        { name: '📅 Dołączył', value: `<t:${joinedTimestamp}:R>`, inline: true },
        { name: '🎂 Konto utworzone', value: `<t:${createdTimestamp}:R>`, inline: true },
        { name: '🏆 Role', value: `${member.roles.cache.size - 1}`, inline: true }
      )
      .setFooter({ text: `ID: ${target.id}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
