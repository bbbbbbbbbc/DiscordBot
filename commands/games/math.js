const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('math')
    .setDescription('Quiz matematyczny'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
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

    const gameId = `math_${channel.id}`;
    if (client.games.has(gameId)) {
      const message = '❌ Quiz już trwa!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    client.games.set(gameId, { answer, startTime: Date.now() });
    const gameMessage = `🧮 **Quiz matematyczny!**\n\nIle to: **${question}** = ?`;
    
    if (isSlash) {
      await interaction.reply(gameMessage);
    } else {
      channel.send(gameMessage);
    }

    const filter = m => !m.author.bot && !isNaN(m.content);
    const collector = channel.createMessageCollector({ filter, time: 15000, max: 1 });

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
        channel.send(`⏱️ Koniec czasu! Odpowiedź to: **${game.answer}**`);
        client.games.delete(gameId);
      }
    });
  },
};
