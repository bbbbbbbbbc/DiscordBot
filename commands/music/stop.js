const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Zatrzymaj muzykę i opuść kanał'),
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
    
    if (queue.ffmpeg) queue.ffmpeg.kill();
    queue.player.stop();
    queue.connection.destroy();
    client.musicQueue.delete(guild.id);

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⏹️ Zatrzymano muzykę')
      .setDescription('Odtwarzanie zostało zatrzymane i opuściłem kanał')
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
