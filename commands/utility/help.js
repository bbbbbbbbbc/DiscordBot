const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Wyświetla wszystkie dostępne komendy',
  aliases: ['h', 'commands'],
  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤖 Komendy Bota')
      .setDescription('Lista wszystkich dostępnych komend')
      .addFields(
        {
          name: '🛡️ Moderacja',
          value: '`!ban` - Banuje użytkownika\n`!kick` - Wyrzuca użytkownika\n`!clear` - Usuwa wiadomości'
        },
        {
          name: '🎮 Gry',
          value: '`!guess` - Zgadywanka liczb\n`!dice` - Rzut kostką\n`!rps` - Kamień, papier, nożyce\n`!tictactoe` - Kółko i krzyżyk\n`!hangman` - Wisielec\n`!trivia` - Quiz wiedzy\n`!blackjack` - Blackjack\n`!roulette` - Rosyjska ruletka\n`!emoji` - Zgadnij emoji\n`!typerace` - Wyścig pisania\n`!math` - Quiz matematyczny\n`!geography` - Quiz geograficzny\n`!wordchain` - Łańcuch słów'
        },
        {
          name: '📊 Użytkowe',
          value: '`!ping` - Opóźnienie bota\n`!serverinfo` - Info o serwerze\n`!avatar` - Avatar użytkownika\n`!userinfo` - Info o użytkowniku'
        },
        {
          name: '🤖 AI',
          value: '`!chat` - Rozmawiaj z AI\n`!ask` - Zadaj pytanie AI'
        },
        {
          name: '📺 YouTube',
          value: '`!download` - Pobierz z YouTube na Drive\n`!ytnotify` - Powiadomienia o nowych filmach'
        },
        {
          name: '❓ Pomoc',
          value: '`!help` - Ta wiadomość'
        }
      )
      .setFooter({ text: `Żądane przez ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
