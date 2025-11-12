const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticker')
    .setDescription('Zarządzaj stickerami servera')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Wyświetl listę stickers')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Informacje o stickerze')
        .addStringOption(option =>
          option.setName('nazwa')
            .setDescription('Nazwa stickera')
            .setRequired(true)
        )
    ),
  
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'list') {
        const stickers = await interaction.guild.stickers.fetch();
        const stickerList = stickers.map(s => `**${s.name}** - ${s.description || 'Brak opisu'}`).join('\n') || 'Brak stickers';

        const embed = new EmbedBuilder()
          .setColor('#9B59B6')
          .setTitle('🎴 Lista Stickers Servera')
          .setDescription(stickerList.substring(0, 4000))
          .addFields(
            { name: '📊 Łącznie', value: `${stickers.size} stickers` }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else if (subcommand === 'info') {
        const name = interaction.options.getString('nazwa');
        const stickers = await interaction.guild.stickers.fetch();
        const sticker = stickers.find(s => s.name === name);

        if (!sticker) {
          return await interaction.reply({ content: '❌ Nie znaleziono stickera o tej nazwie!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setColor('#9B59B6')
          .setTitle(`🎴 Informacje o Stickerze`)
          .addFields(
            { name: '📝 Nazwa', value: sticker.name, inline: true },
            { name: '🆔 ID', value: sticker.id, inline: true },
            { name: '📄 Opis', value: sticker.description || 'Brak opisu' },
            { name: '🏷️ Tagi', value: sticker.tags || 'Brak tagów', inline: true },
            { name: '🔗 URL', value: sticker.url }
          )
          .setThumbnail(sticker.url)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Błąd w komendzie sticker:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zarządzania stickerami!', ephemeral: true });
    }
  },
};
