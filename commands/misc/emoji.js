const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Zarządzaj emoji servera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Dodaj emoji')
        .addStringOption(option =>
          option.setName('nazwa')
            .setDescription('Nazwa emoji')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('url')
            .setDescription('URL obrazka emoji')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Usuń emoji')
        .addStringOption(option =>
          option.setName('nazwa')
            .setDescription('Nazwa emoji do usunięcia')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Wyświetl listę emoji')
    ),
  
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'add') {
        const name = interaction.options.getString('nazwa');
        const url = interaction.options.getString('url');

        try {
          const emoji = await interaction.guild.emojis.create({ attachment: url, name: name });

          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Emoji Dodane')
            .addFields(
              { name: '📝 Nazwa', value: name, inline: true },
              { name: '😀 Emoji', value: `${emoji}`, inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        } catch (error) {
          await interaction.reply({ content: '❌ Nie można dodać emoji! Sprawdź URL i limit emoji na serwerze.', ephemeral: true });
        }
      } else if (subcommand === 'remove') {
        const name = interaction.options.getString('nazwa');
        const emoji = interaction.guild.emojis.cache.find(e => e.name === name);

        if (!emoji) {
          return await interaction.reply({ content: '❌ Nie znaleziono emoji o tej nazwie!', ephemeral: true });
        }

        await emoji.delete();

        const embed = new EmbedBuilder()
          .setColor('#E74C3C')
          .setTitle('🗑️ Emoji Usunięte')
          .addFields(
            { name: '📝 Nazwa', value: name }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else if (subcommand === 'list') {
        const emojis = interaction.guild.emojis.cache.map(e => `${e} - \`:${e.name}:\``).join('\n') || 'Brak emoji';

        const embed = new EmbedBuilder()
          .setColor('#3498DB')
          .setTitle('😀 Lista Emoji Servera')
          .setDescription(emojis.substring(0, 4000))
          .addFields(
            { name: '📊 Łącznie', value: `${interaction.guild.emojis.cache.size} emoji` }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Błąd w komendzie emoji:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zarządzania emoji!', ephemeral: true });
    }
  },
};
