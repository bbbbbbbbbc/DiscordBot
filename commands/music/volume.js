const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ustaw głośność (1-100)')
    .addIntegerOption(option =>
      option.setName('poziom')
        .setDescription('Poziom głośności (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
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

    let volume;
    if (isSlash) {
      volume = interaction.options.getInteger('poziom');
    } else {
      volume = parseInt(args[0]);
      if (!volume || volume < 1 || volume > 100) {
        return interaction.reply('❌ Podaj głośność od 1 do 100!');
      }
    }

    const queue = client.musicQueue.get(guild.id);
    
    if (queue.player.state.resource && queue.player.state.resource.volume) {
      queue.player.state.resource.volume.setVolume(volume / 100);
    }

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('🔊 Głośność')
      .setDescription(`Ustawiono głośność na **${volume}%**`)
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
