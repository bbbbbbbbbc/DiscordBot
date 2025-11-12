const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('geography')
    .setDescription('Quiz geograficzny'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const questions = [
      { q: 'Jaka jest stolica Francji?', a: 'paryż' },
      { q: 'Jaka jest największa pustynia na świecie?', a: 'sahara' },
      { q: 'Jaka jest najdłuższa rzeka na świecie?', a: 'nil' },
      { q: 'Który kontynent jest największy?', a: 'azja' },
      { q: 'W jakim kraju znajduje się Taj Mahal?', a: 'indie' },
      { q: 'Jaka jest stolica Japonii?', a: 'tokio' },
      { q: 'Która góra jest najwyższa na świecie?', a: 'mount everest' },
    ];

    const q = questions[Math.floor(Math.random() * questions.length)];
    const gameId = `geo_${channel.id}`;

    if (client.games.has(gameId)) {
      const message = '❌ Quiz już trwa!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    client.games.set(gameId, { answer: q.a });
    const gameMessage = `🌍 **Quiz geograficzny!**\n\n${q.q}`;
    
    if (isSlash) {
      await interaction.reply(gameMessage);
    } else {
      channel.send(gameMessage);
    }

    const filter = m => !m.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 20000, max: 1 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      
      if (m.content.toLowerCase().includes(game.answer)) {
        m.reply('🎉 Brawo! Poprawna odpowiedź!');
      } else {
        m.reply(`❌ Niestety! Poprawna odpowiedź to: **${game.answer}**`);
      }
      client.games.delete(gameId);
    });

    collector.on('end', collected => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        channel.send(`⏱️ Koniec czasu! Odpowiedź to: **${game.answer}**`);
        client.games.delete(gameId);
      }
    });
  },
};
