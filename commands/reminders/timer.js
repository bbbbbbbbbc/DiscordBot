const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Timer odliczający')
    .addStringOption(option =>
      option.setName('czas')
        .setDescription('Czas timera (np. 30s, 5m, 2h)')
        .setRequired(true)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    let timeArg;
    if (isSlash) {
      timeArg = interaction.options.getString('czas').toLowerCase();
    } else {
      if (!args[0]) {
        return interaction.reply('❌ Użyj: !timer <czas>\nPrzykład: !timer 5m');
      }
      timeArg = args[0].toLowerCase();
    }

    let seconds = 0;

    if (timeArg.endsWith('s')) {
      seconds = parseInt(timeArg);
    } else if (timeArg.endsWith('m')) {
      seconds = parseInt(timeArg) * 60;
    } else if (timeArg.endsWith('h')) {
      seconds = parseInt(timeArg) * 3600;
    } else {
      const message = '❌ Nieprawidłowy format czasu! Użyj: 30s, 5m, 2h';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    if (seconds < 1 || seconds > 3600) {
      const message = '❌ Czas musi być między 1s a 1h!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⏱️ Timer')
      .setDescription(`Odliczanie: **${seconds}s**`)
      .setTimestamp();

    let msg;
    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
      msg = await interaction.fetchReply();
    } else {
      msg = await interaction.reply({ embeds: [embed] });
    }

    const interval = setInterval(() => {
      seconds--;
      
      if (seconds <= 0) {
        clearInterval(interval);
        
        const doneEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('⏱️ Timer zakończony!')
          .setDescription('🔔 Czas minął!')
          .setTimestamp();
        
        msg.edit({ embeds: [doneEmbed] });
        channel.send(`${author} ⏱️ Timer zakończony!`);
      } else if (seconds % 10 === 0 || seconds <= 5) {
        const updateEmbed = new EmbedBuilder()
          .setColor('#3498DB')
          .setTitle('⏱️ Timer')
          .setDescription(`Odliczanie: **${seconds}s**`)
          .setTimestamp();
        
        msg.edit({ embeds: [updateEmbed] }).catch(() => {});
      }
    }, 1000);
  },
};
