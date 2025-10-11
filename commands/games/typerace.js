module.exports = {
  name: 'typerace',
  description: 'Wyścig pisania',
  async execute(message, args, client) {
    const texts = [
      'Szybkie pisanie to bardzo przydatna umiejętność',
      'Discord bot napisany w JavaScript',
      'Programowanie jest fascynujące',
      'Ćwicz pisanie każdego dnia',
      'Gry komputerowe to świetna rozrywka'
    ];

    const text = texts[Math.floor(Math.random() * texts.length)];
    const gameId = `type_${message.channel.id}`;

    if (client.games.has(gameId)) {
      return message.reply('❌ Gra już trwa na tym kanale!');
    }

    client.games.set(gameId, { text, startTime: Date.now() });
    message.channel.send(`⌨️ **Wyścig pisania!**\n\nPrzepisz dokładnie ten tekst:\n\`\`\`${text}\`\`\``);

    const filter = m => !m.author.bot;
    const collector = message.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      
      if (m.content === game.text) {
        const time = ((Date.now() - game.startTime) / 1000).toFixed(2);
        const wpm = Math.round((game.text.length / 5) / (time / 60));
        m.reply(`🏁 **Gratulacje!**\n⏱️ Czas: ${time}s\n📊 Prędkość: ${wpm} WPM\n🏆 Wygrywa: ${m.author}`);
        client.games.delete(gameId);
        collector.stop();
      }
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        message.channel.send('⏱️ Nikt nie ukończył wyścigu na czas!');
        client.games.delete(gameId);
      }
    });
  },
};
