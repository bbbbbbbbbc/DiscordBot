const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Pokaż kolejkę utworów'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const guild = isSlash ? interaction.guild : interaction.guild;
    
    if (!client.musicQueue || !client.musicQueue.has(guild.id)) {
      const message = '❌ Kolejka jest pusta!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const queue = client.musicQueue.get(guild.id);
    
    if (!queue.queue || queue.queue.length === 0) {
      const message = '❌ Kolejka jest pusta!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🎵 Kolejka utworów')
      .setDescription(
        queue.queue.map((song, index) => {
          return `${index + 1}. [${song.title}](${song.url}) - \`${song.durationRaw}\``;
        }).join('\n')
      )
      .setFooter({ text: `Utworów w kolejce: ${queue.queue.length}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
