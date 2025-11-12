const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Wyślij sugestię do administracji')
    .addStringOption(option =>
      option.setName('sugestia')
        .setDescription('Twoja sugestia')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const suggestion = interaction.options.getString('sugestia');

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('💡 Nowa Sugestia')
        .setDescription(suggestion)
        .addFields(
          { name: '👤 Autor', value: `${interaction.user.tag}`, inline: true },
          { name: '📅 Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      // Send to suggestions channel if exists
      const suggestionsChannel = interaction.guild.channels.cache.find(
        ch => ch.name === 'sugestie' || ch.name === 'suggestions'
      );

      if (suggestionsChannel) {
        const message = await suggestionsChannel.send({ embeds: [embed] });
        await message.react('👍');
        await message.react('👎');

        await interaction.reply({ 
          content: '✅ Sugestia została wysłana do administracji!', 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Błąd w komendzie suggest:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wysyłania sugestii!', ephemeral: true });
    }
  },
};
