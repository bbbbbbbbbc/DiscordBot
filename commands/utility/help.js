const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Wyświetla wszystkie dostępne komendy'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🤖 Komendy Bota')
      .setDescription('Lista wszystkich dostępnych komend')
      .addFields(
        {
          name: '🛡️ Moderacja',
          value: '`/ban` - Banuje użytkownika\n`/kick` - Wyrzuca użytkownika\n`/clear` - Usuwa wiadomości\n`/automod` - Automoderacja\n`/filter` - Filtr słów'
        },
        {
          name: '🎮 Gry',
          value: '`/guess` - Zgadywanka\n`/dice` - Rzut kostką\n`/rps` - Kamień, papier, nożyce\n`/tictactoe` - Kółko i krzyżyk\n`/hangman` - Wisielec\n`/trivia` - Quiz wiedzy\n`/blackjack` - Blackjack\n`/roulette` - Rosyjska ruletka\n`/emoji` - Zgadnij emoji\n`/typerace` - Wyścig pisania\n`/math` - Quiz matematyczny\n`/geography` - Quiz geograficzny\n`/wordchain` - Łańcuch słów\n`/memory` - Gra memory\n`/imagequiz` - Quiz obrazkowy'
        },
        {
          name: '💰 Ekonomia',
          value: '`/balance` - Sprawdź saldo\n`/daily` - Dzienna nagroda\n`/work` - Pracuj\n`/shop` - Sklep\n`/buy` - Kup przedmiot\n`/inventory` - Ekwipunek\n`/pay` - Przekaż pieniądze\n`/leaderboard` - Ranking'
        },
        {
          name: '⭐ Poziomy',
          value: '`/rank` - Twój poziom\n`/levels` - Ranking poziomów\n`/setxp` - (Admin) Ustaw XP'
        },
        {
          name: '🎵 Muzyka',
          value: '`/play` - Odtwórz\n`/stop` - Zatrzymaj\n`/skip` - Pomiń\n`/queue` - Kolejka\n`/pause` - Pauza\n`/resume` - Wznów\n`/volume` - Głośność'
        },
        {
          name: '⏰ Przypomnienia',
          value: '`/remind` - Ustaw przypomnienie\n`/timer` - Timer\n`/reminders` - Lista'
        },
        {
          name: '📊 Ankiety',
          value: '`/poll` - Ankieta\n`/vote` - Głosowanie tak/nie'
        },
        {
          name: '😂 Rozrywka',
          value: '`/meme` - Losowy mem\n`/cat` - Zdjęcie kota\n`/dog` - Zdjęcie psa\n`/joke` - Żart'
        },
        {
          name: '📈 Statystyki',
          value: '`/serverstats` - Statystyki serwera\n`/userstats` - Statystyki użytkownika\n`/activity` - Wykres aktywności'
        },
        {
          name: '📊 Użytkowe',
          value: '`/ping` - Opóźnienie\n`/serverinfo` - Info o serwerze\n`/avatar` - Avatar\n`/userinfo` - Info o użytkowniku'
        },
        {
          name: '🤖 AI',
          value: '`/chat` - Rozmawiaj z AI\n`/ask` - Zadaj pytanie'
        },
        {
          name: '📺 YouTube',
          value: '`/download` - Pobierz z YouTube\n`/ytnotify` - Powiadomienia'
        },
        {
          name: '❓ Pomoc',
          value: '`/help` - Ta wiadomość'
        }
      )
      .setFooter({ text: `Żądane przez ${author.tag}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
