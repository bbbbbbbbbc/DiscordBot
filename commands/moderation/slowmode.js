const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Ustaw tryb powolny na kanale')
    .addIntegerOption(option =>
      option.setName('sekund')
        .setDescription('Opóźnienie w sekundach (0 aby wyłączyć)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      const msg = '❌ Nie masz uprawnień do zarządzania kanałami!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const seconds = isSlash ? interaction.options.getInteger('sekund') : parseInt(interaction.content.split(' ')[1]);

    if (seconds === undefined || isNaN(seconds)) {
      const msg = '❌ Podaj prawidłową liczbę sekund (0-21600)!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      
      const msg = seconds === 0 
        ? '✅ Tryb powolny został wyłączony!'
        : `✅ Tryb powolny ustawiony na **${seconds} sekund**!`;
      
      isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    } catch (error) {
      console.error(error);
      const errorMsg = '❌ Wystąpił błąd podczas ustawiania trybu powolnego!';
      isSlash ? await interaction.reply(errorMsg) : interaction.reply(errorMsg);
    }
  },
};
