const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Ustaw przypomnienie')
    .addStringOption(option =>
      option.setName('czas')
        .setDescription('Czas przypomnienia (np. 10s, 5m, 2h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('wiadomość')
        .setDescription('Treść przypomnienia')
        .setRequired(true)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    let timeArg, reminderText;
    
    if (isSlash) {
      timeArg = interaction.options.getString('czas').toLowerCase();
      reminderText = interaction.options.getString('wiadomość');
    } else {
      if (args.length < 2) {
        return interaction.reply('❌ Użyj: !remind <czas> <wiadomość>\nPrzykład: !remind 10m Sprawdź piekarnik');
      }
      timeArg = args[0].toLowerCase();
      reminderText = args.slice(1).join(' ');
    }

    let time = 0;
    if (timeArg.endsWith('s')) {
      time = parseInt(timeArg) * 1000;
    } else if (timeArg.endsWith('m')) {
      time = parseInt(timeArg) * 60000;
    } else if (timeArg.endsWith('h')) {
      time = parseInt(timeArg) * 3600000;
    } else if (timeArg.endsWith('d')) {
      time = parseInt(timeArg) * 86400000;
    } else {
      const message = '❌ Nieprawidłowy format czasu! Użyj: 10s, 5m, 2h, 1d';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    if (time < 1000 || time > 2592000000) {
      const message = '❌ Czas musi być między 1s a 30 dniami!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('⏰ Przypomnienie ustawione!')
      .setDescription(`Przypomnę Ci za **${timeArg}**\n\n📝 "${reminderText}"`)
      .setFooter({ text: `Ustaw: ${author.tag}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }

    if (!client.reminders) client.reminders = new Map();
    
    const reminderId = `${author.id}_${Date.now()}`;
    const timeout = setTimeout(async () => {
      const reminderEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('⏰ Przypomnienie!')
        .setDescription(`📝 ${reminderText}`)
        .setFooter({ text: `Przypomnienie od ${timeArg} temu` })
        .setTimestamp();

      try {
        await author.send({ embeds: [reminderEmbed] });
      } catch {
        channel.send(`${author} ⏰ Przypomnienie: ${reminderText}`);
      }
      
      client.reminders.delete(reminderId);
    }, time);

    client.reminders.set(reminderId, {
      userId: author.id,
      text: reminderText,
      time: timeArg,
      timeout
    });
  },
};
