const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '../../data/stats.json');

function getStats() {
  if (!fs.existsSync(statsPath)) {
    fs.writeFileSync(statsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Wykres aktywności serwera'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const guild = isSlash ? interaction.guild : interaction.guild;
    
    const stats = getStats();
    
    const topUsers = Object.entries(stats)
      .map(([userId, data]) => ({
        userId,
        messages: data.messages || 0
      }))
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 10);

    if (topUsers.length === 0) {
      const message = '❌ Brak danych aktywności!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const maxMessages = topUsers[0].messages;
    const barLength = 20;

    const activityText = await Promise.all(
      topUsers.map(async (entry, index) => {
        try {
          const user = await client.users.fetch(entry.userId);
          const barFilled = Math.floor((entry.messages / maxMessages) * barLength);
          const bar = '█'.repeat(barFilled) + '░'.repeat(barLength - barFilled);
          return `${index + 1}. **${user.username}**\n${bar} ${entry.messages} wiadomości`;
        } catch {
          return `${index + 1}. Nieznany użytkownik\n${'█'.repeat(Math.floor((entry.messages / maxMessages) * barLength))} ${entry.messages}`;
        }
      })
    );

    const embed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('📊 Wykres Aktywności')
      .setDescription('Top 10 najbardziej aktywnych użytkowników\n\n' + activityText.join('\n\n'))
      .setFooter({ text: `Aktywność na ${guild.name}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
