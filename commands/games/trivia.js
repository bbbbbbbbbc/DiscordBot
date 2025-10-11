module.exports = {
  name: 'trivia',
  description: 'Quiz wiedzy ogólnej',
  async execute(message, args, client) {
    const questions = [
      { q: 'Jaka jest stolica Polski?', a: 'warszawa', opts: ['Kraków', 'Warszawa', 'Gdańsk', 'Wrocław'] },
      { q: 'Ile planet jest w Układzie Słonecznym?', a: '8', opts: ['7', '8', '9', '10'] },
      { q: 'Kto namalował Mona Lisę?', a: 'leonardo da vinci', opts: ['Picasso', 'Van Gogh', 'Leonardo da Vinci', 'Rembrandt'] },
      { q: 'Jaki jest największy ocean?', a: 'spokojny', opts: ['Atlantycki', 'Indyjski', 'Spokojny', 'Arktyczny'] },
      { q: 'W którym roku człowiek wylądował na Księżycu?', a: '1969', opts: ['1965', '1969', '1972', '1975'] },
    ];

    const q = questions[Math.floor(Math.random() * questions.length)];
    const gameId = `trivia_${message.channel.id}`;

    if (client.games.has(gameId)) {
      return message.reply('❌ Pytanie już czeka na odpowiedź!');
    }

    client.games.set(gameId, { answer: q.a });

    message.channel.send(`❓ **${q.q}**\n\n${q.opts.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nWpisz numer lub odpowiedź!`);

    const filter = m => !m.author.bot;
    const collector = message.channel.createMessageCollector({ filter, time: 20000, max: 1 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      const answer = m.content.toLowerCase();
      
      if (answer === game.answer || q.opts[parseInt(answer) - 1]?.toLowerCase() === q.a) {
        m.reply('✅ Brawo! Poprawna odpowiedź!');
      } else {
        m.reply(`❌ Niestety! Poprawna odpowiedź to: **${q.opts.find(o => o.toLowerCase() === q.a)}**`);
      }
      
      client.games.delete(gameId);
    });

    collector.on('end', collected => {
      if (client.games.has(gameId)) {
        message.channel.send(`⏱️ Koniec czasu! Poprawna odpowiedź to: **${q.opts.find(o => o.toLowerCase() === q.a)}**`);
        client.games.delete(gameId);
      }
    });
  },
};
