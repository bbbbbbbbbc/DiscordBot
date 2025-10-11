module.exports = {
  name: 'guess',
  description: 'Zgadnij liczbę od 1 do 100',
  async execute(message, args, client) {
    const number = Math.floor(Math.random() * 100) + 1;
    const gameId = `guess_${message.channel.id}`;
    
    if (client.games.has(gameId)) {
      return message.reply('❌ Gra już trwa na tym kanale!');
    }

    client.games.set(gameId, { number, attempts: 0 });
    message.channel.send('🎲 **Zgadywanka!** Zgadnij liczbę od 1 do 100! Masz 10 prób. Wpisz liczbę aby zgadywać.');

    const filter = m => !m.author.bot && !isNaN(m.content);
    const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 10 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      game.attempts++;
      const guess = parseInt(m.content);

      if (guess === game.number) {
        m.reply(`🎉 Brawo! Zgadłeś liczbę ${game.number} w ${game.attempts} próbach!`);
        client.games.delete(gameId);
        collector.stop();
      } else if (guess < game.number) {
        m.reply(`📈 Za mało! Próba ${game.attempts}/10`);
      } else {
        m.reply(`📉 Za dużo! Próba ${game.attempts}/10`);
      }
    });

    collector.on('end', collected => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        message.channel.send(`⏱️ Koniec czasu! Liczba to: ${game.number}`);
        client.games.delete(gameId);
      }
    });
  },
};
