const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Zmień ikonę servera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL nowej ikony servera')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const iconUrl = interaction.options.getString('url');

      try {
        await interaction.guild.setIcon(iconUrl);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Ikona Servera Zmieniona')
          .setDescription('Nowa ikona została ustawiona!')
          .setImage(iconUrl)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: '❌ Nie można zmienić ikony servera! Sprawdź czy URL jest prawidłowy.', ephemeral: true });
      }
    } catch (error) {
      console.error('Błąd w komendzie servericon:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zmiany ikony servera!', ephemeral: true });
    }
  },
};
