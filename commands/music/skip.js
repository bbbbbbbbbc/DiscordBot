const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pomiń aktualny utwór'),
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
    
    if (queue.queue.length <= 1) {
      queue.player.stop();
      queue.connection.destroy();
      client.musicQueue.delete(guild.id);
      const message = '⏭️ Pominięto utwór i zakończono odtwarzanie (brak kolejnych utworów)';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    queue.player.stop();

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⏭️ Pominięto utwór')
      .setDescription('Odtwarzam następny utwór z kolejki')
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
