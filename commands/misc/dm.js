const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Wyślij DM do użytkownika')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do wysłania DM')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('wiadomość')
        .setDescription('Wiadomość do wysłania')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('użytkownik');
      const message = interaction.options.getString('wiadomość');

      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('📬 Wiadomość od Administracji')
        .setDescription(message)
        .setFooter({ text: `Serwer: ${interaction.guild.name}` })
        .setTimestamp();

      try {
        await target.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Wiadomość została wysłana do ${target.tag}!`, ephemeral: true });
      } catch (error) {
        await interaction.reply({ content: `❌ Nie można wysłać DM do ${target.tag}. Prawdopodobnie ma wyłączone DM.`, ephemeral: true });
      }
    } catch (error) {
      console.error('Błąd w komendzie dm:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wysyłania DM!', ephemeral: true });
    }
  },
};
