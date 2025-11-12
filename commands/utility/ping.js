const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Sprawdź opóźnienie bota'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (isSlash) {
      const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
      const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply(`🏓 Pong!\n📊 Opóźnienie: ${timeDiff}ms\n💓 API Latency: ${Math.round(client.ws.ping)}ms`);
    } else {
      const sent = await interaction.reply('🏓 Pong!');
      const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
      sent.edit(`🏓 Pong!\n📊 Opóźnienie: ${timeDiff}ms\n💓 API Latency: ${Math.round(client.ws.ping)}ms`);
    }
  },
};
