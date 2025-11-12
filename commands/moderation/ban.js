const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banuje użytkownika z serwera')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do zbanowania')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód bana')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const author = isSlash ? interaction.user : interaction.author;
    const guild = isSlash ? interaction.guild : interaction.guild;

    if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const message = '❌ Nie masz uprawnień do banowania użytkowników!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    let user, reason;
    if (isSlash) {
      user = interaction.options.getUser('użytkownik');
      reason = interaction.options.getString('powód') || 'Nie podano powodu';
    } else {
      user = interaction.mentions.users.first();
      if (!user) {
        return interaction.reply('❌ Musisz oznaczyć użytkownika do zbanowania! Użyj: `/ban @użytkownik [powód]`');
      }
      reason = args.slice(1).join(' ') || 'Nie podano powodu';
    }

    const targetMember = guild.members.cache.get(user.id);

    if (!targetMember) {
      const message = '❌ Nie można znaleźć tego użytkownika na serwerze!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    if (!targetMember.bannable) {
      const message = '❌ Nie mogę zbanować tego użytkownika!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    try {
      await targetMember.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔨 Użytkownik zbanowany')
        .addFields(
          { name: 'Użytkownik', value: user.tag, inline: true },
          { name: 'Powód', value: reason, inline: true },
          { name: 'Zbanowany przez', value: author.tag, inline: true }
        )
        .setTimestamp();
      
      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      const message = '❌ Nie udało się zbanować użytkownika!';
      if (isSlash) {
        await interaction.reply(message);
      } else {
        interaction.reply(message);
      }
    }
  },
};
