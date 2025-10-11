module.exports = {
  name: 'dice',
  description: 'Rzut kostką',
  aliases: ['roll'],
  async execute(message, args) {
    const sides = parseInt(args[0]) || 6;
    if (sides < 2 || sides > 100) {
      return message.reply('❌ Podaj liczbę ścian od 2 do 100! Użyj: `!dice [liczba ścian]`');
    }

    const result = Math.floor(Math.random() * sides) + 1;
    message.reply(`🎲 Rzuciłeś kostką D${sides} i wypadło: **${result}**`);
  },
};
