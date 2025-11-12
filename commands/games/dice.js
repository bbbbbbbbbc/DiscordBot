const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Rzut kostką')
    .addIntegerOption(option =>
      option.setName('ściany')
        .setDescription('Liczba ścian kostki (2-100)')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100)
    ),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    let sides;
    if (isSlash) {
      sides = interaction.options.getInteger('ściany') || 6;
    } else {
      sides = parseInt(args[0]) || 6;
    }
    
    if (sides < 2 || sides > 100) {
      const message = '❌ Podaj liczbę ścian od 2 do 100!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const result = Math.floor(Math.random() * sides) + 1;
    const response = `🎲 Rzuciłeś kostką D${sides} i wypadło: **${result}**`;
    
    if (isSlash) {
      await interaction.reply(response);
    } else {
      interaction.reply(response);
    }
  },
};
