const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Wznów odtwarzanie'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const guild = isSlash ? interaction.guild : interaction.guild;
    
    if (!member.voice.channel) {
      const message = '❌ Musisz być na kanale głosowym!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    if (!client.musicQueue || !client.musicQueue.has(guild.id)) {
      const message = '❌ Nie gram żadnej muzyki!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const queue = client.musicQueue.get(guild.id);
    
    if (queue.player.state.status !== AudioPlayerStatus.Paused) {
      const message = '❌ Muzyka nie jest wstrzymana!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    queue.player.unpause();

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('▶️ Wznowiono')
      .setDescription('Odtwarzanie zostało wznowione')
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
