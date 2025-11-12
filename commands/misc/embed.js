const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Stwórz własny embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option =>
      option.setName('tytuł')
        .setDescription('Tytuł embeda')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('opis')
        .setDescription('Opis embeda')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('kolor')
        .setDescription('Kolor embeda (hex np. #FF0000)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('miniatura')
        .setDescription('URL miniaturki')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const title = interaction.options.getString('tytuł');
      const description = interaction.options.getString('opis');
      const color = interaction.options.getString('kolor') || '#3498DB';
      const thumbnail = interaction.options.getString('miniatura');

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();

      if (thumbnail) {
        embed.setThumbnail(thumbnail);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie embed:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas tworzenia embeda!', ephemeral: true });
    }
  },
};
