const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Zgłoś użytkownika do moderacji')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do zgłoszenia')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód zgłoszenia')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('użytkownik');
      const reason = interaction.options.getString('powód');

      if (target.id === interaction.user.id) {
        return await interaction.reply({ content: '❌ Nie możesz zgłosić samego siebie!', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🚨 Nowe Zgłoszenie')
        .addFields(
          { name: '👤 Zgłoszony', value: `${target.tag} (${target.id})`, inline: true },
          { name: '📝 Zgłaszający', value: `${interaction.user.tag}`, inline: true },
          { name: '⚠️ Powód', value: reason },
          { name: '📅 Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      // Send to reports channel if exists
      const reportsChannel = interaction.guild.channels.cache.find(
        ch => ch.name === 'zgłoszenia' || ch.name === 'reports'
      );

      if (reportsChannel) {
        await reportsChannel.send({ embeds: [embed] });
        await interaction.reply({ 
          content: '✅ Zgłoszenie zostało wysłane do moderacji!', 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: '❌ Brak kanału zgłoszeń! Skontaktuj się z administratorem.', 
          ephemeral: true 
        });
      }
    } catch (error) {
      console.error('Błąd w komendzie report:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas zgłaszania!', ephemeral: true });
    }
  },
};
