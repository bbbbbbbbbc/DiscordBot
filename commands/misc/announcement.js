const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcement')
    .setDescription('Wyślij ogłoszenie')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option.setName('tytuł')
        .setDescription('Tytuł ogłoszenia')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('treść')
        .setDescription('Treść ogłoszenia')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('kanał')
        .setDescription('Kanał do wysłania ogłoszenia')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const title = interaction.options.getString('tytuł');
      const content = interaction.options.getString('treść');
      const channel = interaction.options.getChannel('kanał') || interaction.channel;

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle(`📢 ${title}`)
        .setDescription(content)
        .setFooter({ text: `Ogłoszenie od ${interaction.user.tag}` })
        .setTimestamp();

      await channel.send({ content: '@everyone', embeds: [embed] });
      await interaction.reply({ content: '✅ Ogłoszenie zostało wysłane!', ephemeral: true });
    } catch (error) {
      console.error('Błąd w komendzie announcement:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wysyłania ogłoszenia!', ephemeral: true });
    }
  },
};
