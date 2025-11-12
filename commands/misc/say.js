const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Bot wysyła wiadomość')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option.setName('wiadomość')
        .setDescription('Wiadomość do wysłania')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('kanał')
        .setDescription('Kanał do wysłania wiadomości')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const message = interaction.options.getString('wiadomość');
      const channel = interaction.options.getChannel('kanał') || interaction.channel;

      await channel.send(message);
      await interaction.reply({ content: '✅ Wiadomość została wysłana!', ephemeral: true });
    } catch (error) {
      console.error('Błąd w komendzie say:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wysyłania wiadomości!', ephemeral: true });
    }
  },
};
