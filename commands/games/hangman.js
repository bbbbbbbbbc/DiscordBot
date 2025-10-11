module.exports = {
  name: 'hangman',
  description: 'Gra w wisielca',
  async execute(message, args, client) {
    const words = ['javascript', 'discord', 'programowanie', 'komputer', 'internet', 'muzyka', 'gra', 'zabawa', 'klawisz', 'ekran'];
    const word = words[Math.floor(Math.random() * words.length)];
    const gameId = `hangman_${message.channel.id}`;

    if (client.games.has(gameId)) {
      return message.reply('❌ Gra już trwa na tym kanale!');
    }

    const guessed = new Set();
    const mistakes = 0;
    const maxMistakes = 6;

    client.games.set(gameId, { word, guessed, mistakes });

    const display = word.split('').map(l => guessed.has(l) ? l : '_').join(' ');
    message.channel.send(`🎯 **Wisielec!** Zgadnij słowo:\n\`${display}\`\nBłędy: ${mistakes}/${maxMistakes}\n\nWpisz literę aby zgadywać!`);

    const filter = m => !m.author.bot && m.content.length === 1 && /[a-ząćęłńóśźż]/i.test(m.content);
    const collector = message.channel.createMessageCollector({ filter, time: 120000 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      const letter = m.content.toLowerCase();

      if (game.guessed.has(letter)) {
        return m.reply('❌ Ta litera była już użyta!').then(msg => setTimeout(() => msg.delete(), 2000));
      }

      game.guessed.add(letter);

      if (!game.word.includes(letter)) {
        game.mistakes++;
      }

      const display = game.word.split('').map(l => game.guessed.has(l) ? l : '_').join(' ');

      if (!display.includes('_')) {
        m.reply(`🎉 Brawo! Odgadłeś słowo: **${game.word}**`);
        client.games.delete(gameId);
        collector.stop();
        return;
      }

      if (game.mistakes >= maxMistakes) {
        m.reply(`💀 Przegrałeś! Słowo to: **${game.word}**`);
        client.games.delete(gameId);
        collector.stop();
        return;
      }

      m.channel.send(`\`${display}\`\nBłędy: ${game.mistakes}/${maxMistakes}\nUżyte litery: ${Array.from(game.guessed).join(', ')}`);
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        message.channel.send(`⏱️ Koniec czasu! Słowo to: **${game.word}**`);
        client.games.delete(gameId);
      }
    });
  },
};
