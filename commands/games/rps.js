module.exports = {
  name: 'rps',
  description: 'Kamień, papier, nożyce',
  async execute(message, args) {
    const choices = ['kamień', 'papier', 'nożyce'];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return message.reply('❌ Wybierz: kamień, papier lub nożyce! Użyj: `!rps [wybór]`');
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

    message.reply(`${emojis[userChoice]} vs ${emojis[botChoice]}\n${result}`);
  },
};
