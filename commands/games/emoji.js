const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Zgadnij co oznacza emoji'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const emojiQuiz = [
      { emoji: '🍕🇮🇹', answer: 'pizza', hint: 'Włoskie danie' },
      { emoji: '🎬🍿', answer: 'kino', hint: 'Miejsce do oglądania filmów' },
      { emoji: '⚽🏆', answer: 'piłka nożna', hint: 'Popularny sport' },
      { emoji: '🎮👾', answer: 'gry', hint: 'Rozrywka elektroniczna' },
      { emoji: '📱💬', answer: 'wiadomość', hint: 'Komunikacja przez telefon' },
    ];

    const q = emojiQuiz[Math.floor(Math.random() * emojiQuiz.length)];
    const gameId = `emoji_${channel.id}`;

    if (client.games.has(gameId)) {
      const message = '❌ Gra już trwa na tym kanale!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    client.games.set(gameId, { answer: q.answer });
    const gameMessage = `🎯 **Zgadnij co oznacza:**\n\n${q.emoji}\n\n💡 Podpowiedź: ${q.hint}`;
    
    if (isSlash) {
      await interaction.reply(gameMessage);
    } else {
      channel.send(gameMessage);
    }

    const filter = m => !m.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 30000, max: 1 });

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
        channel.send(`⏱️ Koniec czasu! Odpowiedź to: **${q.answer}**`);
        client.games.delete(gameId);
      }
    });
  },
};
