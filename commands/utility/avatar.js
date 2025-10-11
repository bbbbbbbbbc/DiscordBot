const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Pokaż avatar użytkownika',
  aliases: ['av'],
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`Avatar: ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setFooter({ text: `Żądane przez ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
