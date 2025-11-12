const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Zmień nickname użytkownika')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do zmiany nicku')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nick')
        .setDescription('Nowy nickname (puste aby zresetować)')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const target = interaction.options.getMember('użytkownik');
      const nickname = interaction.options.getString('nick') || null;

      if (!target) {
        return await interaction.reply({ content: '❌ Nie znaleziono użytkownika na tym serwerze!', ephemeral: true });
      }

      const oldNick = target.nickname || target.user.username;

      try {
        await target.setNickname(nickname);

        const embed = new EmbedBuilder()
          .setColor('#2ECC71')
          .setTitle('✏️ Zmiana Nicku')
          .addFields(
            { name: '👤 Użytkownik', value: `${target.user.tag}`, inline: true },
            { name: '📝 Stary nick', value: oldNick, inline: true },
            { name: '✅ Nowy nick', value: nickname || target.user.username, inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({ content: '❌ Nie mogę zmienić nicku tego użytkownika! (sprawdź hierarchię ról)', ephemeral: true });
      }
    } catch (error) {
      console.error('Błąd w komendzie nickname:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zmiany nicku!', ephemeral: true });
    }
  },
};
