const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminders')
    .setDescription('Lista twoich przypomnień'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    
    if (!client.reminders || client.reminders.size === 0) {
      const message = '❌ Nie masz aktywnych przypomnień!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const userReminders = Array.from(client.reminders.entries())
      .filter(([id, reminder]) => reminder.userId === author.id);

    if (userReminders.length === 0) {
      const message = '❌ Nie masz aktywnych przypomnień!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('📋 Twoje Przypomnienia')
      .setDescription(
        userReminders.map(([id, reminder], index) => {
          return `${index + 1}. **${reminder.time}** - ${reminder.text}`;
        }).join('\n\n')
      )
      .setFooter({ text: `Aktywnych przypomnień: ${userReminders.length}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
