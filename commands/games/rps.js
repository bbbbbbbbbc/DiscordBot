const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Kamień, papier, nożyce')
    .addStringOption(option =>
      option.setName('wybór')
        .setDescription('Twój wybór')
        .setRequired(true)
        .addChoices(
          { name: '🪨 Kamień', value: 'kamień' },
          { name: '📄 Papier', value: 'papier' },
          { name: '✂️ Nożyce', value: 'nożyce' }
        )
    ),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const choices = ['kamień', 'papier', 'nożyce'];
    
    let userChoice;
    if (isSlash) {
      userChoice = interaction.options.getString('wybór');
    } else {
      userChoice = args[0]?.toLowerCase();
    }

    if (!choices.includes(userChoice)) {
      const message = '❌ Wybierz: kamień, papier lub nożyce!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const emojis = { 'kamień': '🪨', 'papier': '📄', 'nożyce': '✂️' };

    let result;
    if (userChoice === botChoice) {
      result = '🤝 Remis!';
    } else if (
      (userChoice === 'kamień' && botChoice === 'nożyce') ||
      (userChoice === 'papier' && botChoice === 'kamień') ||
      (userChoice === 'nożyce' && botChoice === 'papier')
    ) {
      result = '🎉 Wygrałeś!';
    } else {
      result = '😢 Przegrałeś!';
    }

    const response = `${emojis[userChoice]} vs ${emojis[botChoice]}\n${result}`;
    
    if (isSlash) {
      await interaction.reply(response);
    } else {
      interaction.reply(response);
    }
  },
};
