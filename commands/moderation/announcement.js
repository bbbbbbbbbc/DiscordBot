const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcement')
    .setDescription('Wyślij ogłoszenie na kanale')
    .addStringOption(option =>
      option.setName('wiadomosc')
        .setDescription('Treść ogłoszenia')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Kanał gdzie wysłać (domyślnie: obecny)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('tag')
        .setDescription('Oznacz użytkowników')
        .setRequired(false)
        .addChoices(
          { name: '@everyone', value: 'everyone' },
          { name: '@here', value: 'here' },
          { name: 'Brak', value: 'none' }
        )
    )
    .addStringOption(option =>
      option.setName('kolor')
        .setDescription('Kolor embeda')
        .setRequired(false)
        .addChoices(
          { name: '🔴 Czerwony', value: '#FF0000' },
          { name: '🔵 Niebieski', value: '#0099FF' },
          { name: '🟢 Zielony', value: '#00FF00' },
          { name: '🟡 Żółty', value: '#FFFF00' },
          { name: '🟣 Fioletowy', value: '#9B59B6' },
          { name: '🟠 Pomarańczowy', value: '#FFA500' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!isSlash && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply('❌ Tylko administratorzy mogą wysyłać ogłoszenia!');
    }

    let message, targetChannel, tag, color;

    if (isSlash) {
      message = interaction.options.getString('wiadomosc');
      targetChannel = interaction.options.getChannel('kanal') || interaction.channel;
      tag = interaction.options.getString('tag') || 'none';
      color = interaction.options.getString('kolor') || '#0099FF';
    } else {
      if (!args[0]) {
        return interaction.reply('❌ Użycie: `!announcement <wiadomość>`\nLub: `!announcement #kanał <wiadomość>`');
      }

      const channelMention = args[0].match(/<#(\d+)>/);
      if (channelMention) {
        targetChannel = interaction.guild.channels.cache.get(channelMention[1]);
        if (!targetChannel) {
          return interaction.reply('❌ Nie znaleziono kanału!');
        }
        message = args.slice(1).join(' ');
      } else {
        targetChannel = interaction.channel;
        message = args.join(' ');
      }
      
      tag = 'none';
      color = '#0099FF';
    }

    if (!message || message.trim() === '') {
      const msg = '❌ Wiadomość nie może być pusta!';
      if (isSlash) {
        return await interaction.reply({ content: msg, ephemeral: true });
      } else {
        return interaction.reply(msg);
      }
    }

    if (!targetChannel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
      const msg = '❌ Nie mam uprawnień do wysyłania wiadomości na tym kanale!';
      if (isSlash) {
        return await interaction.reply({ content: msg, ephemeral: true });
      } else {
        return interaction.reply(msg);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('📢 Ogłoszenie')
      .setDescription(message)
      .setFooter({ text: `Wysłane przez ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    try {
      let tagText = '';
      if (tag === 'everyone') {
        tagText = '@everyone';
      } else if (tag === 'here') {
        tagText = '@here';
      }

      await targetChannel.send({
        content: tagText || null,
        embeds: [embed]
      });

      const successMsg = `✅ Ogłoszenie wysłane na ${targetChannel}!`;
      if (isSlash) {
        await interaction.reply({ content: successMsg, ephemeral: true });
      } else {
        await interaction.reply(successMsg);
        setTimeout(() => interaction.delete().catch(() => {}), 3000);
      }
    } catch (error) {
      console.error('[ANNOUNCEMENT] Error:', error);
      const errorMsg = '❌ Wystąpił błąd podczas wysyłania ogłoszenia!';
      if (isSlash) {
        await interaction.reply({ content: errorMsg, ephemeral: true });
      } else {
        interaction.reply(errorMsg);
      }
    }
  },
};
