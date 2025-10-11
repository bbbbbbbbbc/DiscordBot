module.exports = {
  name: 'math',
  description: 'Quiz matematyczny',
  async execute(message, args, client) {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    
    let answer;
    let question;
    
    if (op === '+') {
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else if (op === '-') {
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    } else {
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
    }

    const gameId = `math_${message.channel.id}`;
    if (client.games.has(gameId)) {
      return message.reply('❌ Quiz już trwa!');
    }

    client.games.set(gameId, { answer, startTime: Date.now() });
    message.channel.send(`🧮 **Quiz matematyczny!**\n\nIle to: **${question}** = ?`);

    const filter = m => !m.author.bot && !isNaN(m.content);
    const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      const time = ((Date.now() - game.startTime) / 1000).toFixed(2);
      
      if (parseInt(m.content) === game.answer) {
        m.reply(`✅ Brawo! Odpowiedź **${game.answer}** jest poprawna!\n⏱️ Czas: ${time}s`);
      } else {
        m.reply(`❌ Niestety! Poprawna odpowiedź to: **${game.answer}**`);
      }
      client.games.delete(gameId);
    });

    collector.on('end', collected => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        message.channel.send(`⏱️ Koniec czasu! Odpowiedź to: **${game.answer}**`);
        client.games.delete(gameId);
      }
    });
  },
};
