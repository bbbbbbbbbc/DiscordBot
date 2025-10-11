const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Wyrzuca użytkownika z serwera',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('❌ Nie masz uprawnień do wyrzucania użytkowników!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Musisz oznaczyć użytkownika do wyrzucenia! Użyj: `!kick @użytkownik [powód]`');
    }

    const reason = args.slice(1).join(' ') || 'Nie podano powodu';
    const member = message.guild.members.cache.get(user.id);

    if (!member) {
      return message.reply('❌ Nie można znaleźć tego użytkownika na serwerze!');
    }

    if (!member.kickable) {
      return message.reply('❌ Nie mogę wyrzucić tego użytkownika!');
    }

    try {
      await member.kick(reason);
      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('👢 Użytkownik wyrzucony')
        .addFields(
          { name: 'Użytkownik', value: user.tag, inline: true },
          { name: 'Powód', value: reason, inline: true },
          { name: 'Wyrzucony przez', value: message.author.tag, inline: true }
        )
        .setTimestamp();
      
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Nie udało się wyrzucić użytkownika!');
    }
  },
};
