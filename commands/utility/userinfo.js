const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Informacje o użytkowniku',
  aliases: ['user', 'whois'],
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Konto utworzone', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 Dołączył', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
        { name: '🎭 Role', value: member ? member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r).join(', ') || 'Brak' : 'N/A' }
      )
      .setFooter({ text: `Żądane przez ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
