const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Dołącz bota do kanału głosowego'),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const guild = isSlash ? interaction.guild : interaction.guild;
    
    if (!member.voice.channel) {
      const message = '❌ Musisz być na kanale głosowym!';
      if (isSlash) {
        return await interaction.reply({ content: message, ephemeral: true });
      } else {
        return interaction.reply(message);
      }
    }

    try {
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      const message = `✅ Dołączyłem do kanału **${member.voice.channel.name}**!`;
      if (isSlash) {
        await interaction.reply(message);
      } else {
        interaction.reply(message);
      }
    } catch (error) {
      console.error('Join error:', error);
      const message = '❌ Nie mogę dołączyć do kanału głosowego!';
      if (isSlash) {
        await interaction.reply({ content: message, ephemeral: true });
      } else {
        interaction.reply(message);
      }
    }
  }
};
