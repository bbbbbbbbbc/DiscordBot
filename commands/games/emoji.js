module.exports = {
  name: 'emoji',
  description: 'Zgadnij co oznacza emoji',
  async execute(message, args, client) {
    const emojiQuiz = [
      { emoji: '🍕🇮🇹', answer: 'pizza', hint: 'Włoskie danie' },
      { emoji: '🎬🍿', answer: 'kino', hint: 'Miejsce do oglądania filmów' },
      { emoji: '⚽🏆', answer: 'piłka nożna', hint: 'Popularny sport' },
      { emoji: '🎮👾', answer: 'gry', hint: 'Rozrywka elektroniczna' },
      { emoji: '📱💬', answer: 'wiadomość', hint: 'Komunikacja przez telefon' },
    ];

    const q = emojiQuiz[Math.floor(Math.random() * emojiQuiz.length)];
    const gameId = `emoji_${message.channel.id}`;

    if (client.games.has(gameId)) {
      return message.reply('❌ Gra już trwa na tym kanale!');
    }

    client.games.set(gameId, { answer: q.answer });
    message.channel.send(`🎯 **Zgadnij co oznacza:**\n\n${q.emoji}\n\n💡 Podpowiedź: ${q.hint}`);

    const filter = m => !m.author.bot;
    const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', m => {
      if (m.content.toLowerCase().includes(q.answer.toLowerCase())) {
        m.reply('🎉 Brawo! Zgadłeś!');
      } else {
        m.reply(`❌ Niestety! Poprawna odpowiedź to: **${q.answer}**`);
      }
      client.games.delete(gameId);
    });

    collector.on('end', collected => {
      if (client.games.has(gameId)) {
        message.channel.send(`⏱️ Koniec czasu! Odpowiedź to: **${q.answer}**`);
        client.games.delete(gameId);
      }
    });
  },
};
