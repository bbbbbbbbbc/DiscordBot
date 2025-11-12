const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Zmień kolor roli')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(option =>
      option.setName('rola')
        .setDescription('Rola do zmiany koloru')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('kolor')
        .setDescription('Nowy kolor w formacie HEX (np. #FF0000)')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const role = interaction.options.getRole('rola');
      const color = interaction.options.getString('kolor');

      // Validate hex color
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return await interaction.reply({ content: '❌ Nieprawidłowy format koloru! Użyj formatu HEX (np. #FF0000)', ephemeral: true });
      }

      try {
        await role.setColor(color);

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle('🎨 Zmiana Koloru Roli')
          .addFields(
            { name: '🏷️ Rola', value: role.name, inline: true },
            { name: '🎨 Nowy kolor', value: color, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: '❌ Nie mogę zmienić koloru tej roli! (sprawdź hierarchię ról)', ephemeral: true });
      }
    } catch (error) {
      console.error('Błąd w komendzie color:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zmiany koloru roli!', ephemeral: true });
    }
  },
};
