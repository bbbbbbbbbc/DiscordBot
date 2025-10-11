const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Banuje użytkownika z serwera',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('❌ Nie masz uprawnień do banowania użytkowników!');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Musisz oznaczyć użytkownika do zbanowania! Użyj: `!ban @użytkownik [powód]`');
    }

    const reason = args.slice(1).join(' ') || 'Nie podano powodu';
    const member = message.guild.members.cache.get(user.id);

    if (!member) {
      return message.reply('❌ Nie można znaleźć tego użytkownika na serwerze!');
    }

    if (!member.bannable) {
      return message.reply('❌ Nie mogę zbanować tego użytkownika!');
    }

    try {
      await member.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔨 Użytkownik zbanowany')
        .addFields(
          { name: 'Użytkownik', value: user.tag, inline: true },
          { name: 'Powód', value: reason, inline: true },
          { name: 'Zbanowany przez', value: message.author.tag, inline: true }
        )
        .setTimestamp();
      
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ Nie udało się zbanować użytkownika!');
    }
  },
};
