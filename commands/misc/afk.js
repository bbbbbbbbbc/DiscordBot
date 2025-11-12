const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const afkUsers = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Ustaw status AFK')
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód AFK')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const reason = interaction.options.getString('powód') || 'AFK';
      const userId = interaction.user.id;

      afkUsers.set(userId, {
        reason: reason,
        time: Date.now()
      });

      const embed = new EmbedBuilder()
        .setColor('#95A5A6')
        .setTitle('💤 Status AFK')
        .setDescription(`${interaction.user} jest teraz AFK`)
        .addFields(
          { name: '📝 Powód', value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie afk:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas ustawiania AFK!', ephemeral: true });
    }
  },
};

// Export afkUsers map for use in message handler
module.exports.afkUsers = afkUsers;
