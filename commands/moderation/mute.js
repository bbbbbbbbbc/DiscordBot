const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Wycisz użytkownika (timeout)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do wyciszenia')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('czas')
        .setDescription('Czas wyciszenia w minutach')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(option =>
      option.setName('powod')
        .setDescription('Powód wyciszenia')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      const msg = '❌ Nie masz uprawnień do wyciszania użytkowników!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const user = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();
    const duration = isSlash ? interaction.options.getInteger('czas') : parseInt(interaction.content.split(' ')[2]);
    const reason = isSlash ? interaction.options.getString('powod') || 'Brak powodu' : interaction.content.split(' ').slice(3).join(' ') || 'Brak powodu';

    if (!user) {
      const msg = '❌ Musisz oznaczyć użytkownika do wyciszenia!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (!duration || isNaN(duration)) {
      const msg = '❌ Podaj prawidłowy czas w minutach (1-40320)!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      const msg = '❌ Nie znaleziono użytkownika na tym serwerze!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (member.id === interaction.user.id) {
      const msg = '❌ Nie możesz wyciszyć samego siebie!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      const msg = '❌ Nie możesz wyciszyć administratora!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    try {
      await member.timeout(duration * 60 * 1000, reason);
      
      const successMsg = `✅ **${user.tag}** został wyciszony na **${duration} minut**\n📝 Powód: ${reason}`;
      isSlash ? await interaction.reply(successMsg) : interaction.reply(successMsg);
    } catch (error) {
      console.error(error);
      const errorMsg = '❌ Wystąpił błąd podczas wyciszania użytkownika!';
      isSlash ? await interaction.reply(errorMsg) : interaction.reply(errorMsg);
    }
  },
};
