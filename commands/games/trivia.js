const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Quiz wiedzy ogólnej'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const questions = [
      { q: 'Jaka jest stolica Polski?', a: 'warszawa', opts: ['Kraków', 'Warszawa', 'Gdańsk', 'Wrocław'] },
      { q: 'Ile planet jest w Układzie Słonecznym?', a: '8', opts: ['7', '8', '9', '10'] },
      { q: 'Kto namalował Mona Lisę?', a: 'leonardo da vinci', opts: ['Picasso', 'Van Gogh', 'Leonardo da Vinci', 'Rembrandt'] },
      { q: 'Jaki jest największy ocean?', a: 'spokojny', opts: ['Atlantycki', 'Indyjski', 'Spokojny', 'Arktyczny'] },
      { q: 'W którym roku człowiek wylądował na Księżycu?', a: '1969', opts: ['1965', '1969', '1972', '1975'] },
    ];

    const q = questions[Math.floor(Math.random() * questions.length)];
    const gameId = `trivia_${channel.id}`;

    if (client.games.has(gameId)) {
      const message = '❌ Pytanie już czeka na odpowiedź!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    client.games.set(gameId, { answer: q.a });

    const questionMessage = `❓ **${q.q}**\n\n${q.opts.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nWpisz numer lub odpowiedź!`;
    
    if (isSlash) {
      await interaction.reply(questionMessage);
    } else {
      channel.send(questionMessage);
    }

    const filter = m => !m.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 20000, max: 1 });

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
        channel.send(`⏱️ Koniec czasu! Poprawna odpowiedź to: **${q.opts.find(o => o.toLowerCase() === q.a)}**`);
        client.games.delete(gameId);
      }
    });
  },
};
