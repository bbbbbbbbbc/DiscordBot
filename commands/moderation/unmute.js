const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Odwycisz użytkownika')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do odwyciszenia')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      const msg = '❌ Nie masz uprawnień do odwyciszania użytkowników!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const user = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();

    if (!user) {
      const msg = '❌ Musisz oznaczyć użytkownika do odwyciszenia!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      const msg = '❌ Nie znaleziono użytkownika na tym serwerze!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    try {
      await member.timeout(null);
      
      const successMsg = `✅ **${user.tag}** został odwyciszony!`;
      isSlash ? await interaction.reply(successMsg) : interaction.reply(successMsg);
    } catch (error) {
      console.error(error);
      const errorMsg = '❌ Wystąpił błąd podczas odwyciszania użytkownika!';
      isSlash ? await interaction.reply(errorMsg) : interaction.reply(errorMsg);
    }
  },
};
