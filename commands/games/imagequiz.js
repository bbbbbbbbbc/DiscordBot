const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('imagequiz')
    .setDescription('Quiz rozpoznawania - co jest na obrazku'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const gameId = `imagequiz_${channel.id}`;
    
    if (client.games.has(gameId)) {
      const message = '❌ Quiz obrazkowy już trwa na tym kanale!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const questions = [
      { answer: 'kot', hints: ['Ma wąsy', 'Mówi miau', 'Lubi myszy'], emoji: '🐱' },
      { answer: 'pies', hints: ['Ma ogon', 'Szczeka', 'Najlepszy przyjaciel człowieka'], emoji: '🐕' },
      { answer: 'samochód', hints: ['Ma koła', 'Jeździ po drodze', 'Potrzebuje paliwa'], emoji: '🚗' },
      { answer: 'pizza', hints: ['Włoskie danie', 'Ma ser', 'Okrągła'], emoji: '🍕' },
      { answer: 'słońce', hints: ['Jest na niebie', 'Daje światło', 'Gorące'], emoji: '☀️' },
      { answer: 'książka', hints: ['Ma strony', 'Można czytać', 'Ma okładkę'], emoji: '📚' },
      { answer: 'telefon', hints: ['Elektroniczne', 'Do dzwonienia', 'Ma ekran'], emoji: '📱' },
      { answer: 'drzewo', hints: ['Rośnie', 'Ma liście', 'Potrzebuje wody'], emoji: '🌳' },
      { answer: 'dom', hints: ['Ludzie w nim mieszkają', 'Ma dach', 'Ma drzwi'], emoji: '🏠' },
      { answer: 'samolot', hints: ['Lata', 'Ma skrzydła', 'Przewozi ludzi'], emoji: '✈️' },
    ];

    const question = questions[Math.floor(Math.random() * questions.length)];
    let hintIndex = 0;
    let attempts = 0;

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('🖼️ Quiz Obrazkowy!')
      .setDescription(`Co jest na tym "obrazku"?\n\n${question.emoji}\n\n💡 Podpowiedź: ${question.hints[0]}`)
      .setFooter({ text: 'Wpisz odpowiedź w czacie!' });

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await channel.send({ embeds: [embed] });
    }
    
    client.games.set(gameId, { question, hintIndex, attempts });

    const filter = m => m.author.id === author.id && !m.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async m => {
      const game = client.games.get(gameId);
      game.attempts++;

      const userAnswer = m.content.toLowerCase().trim();
      
      if (userAnswer === game.question.answer) {
        const winEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎉 Brawo!')
          .setDescription(`Poprawna odpowiedź: **${game.question.answer}**\nOdgadłeś w ${game.attempts} próbach!`)
          .setFooter({ text: `Gracz: ${author.tag}` });
        
        await channel.send({ embeds: [winEmbed] });
        client.games.delete(gameId);
        collector.stop();
      } else {
        if (game.attempts >= 3 && game.hintIndex < game.question.hints.length - 1) {
          game.hintIndex++;
          const hintEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('❌ Źle!')
            .setDescription(`To nie to! Oto kolejna podpowiedź:\n\n💡 ${game.question.hints[game.hintIndex]}`)
            .setFooter({ text: `Próba ${game.attempts}` });
          
          await channel.send({ embeds: [hintEmbed] });
        } else {
          await m.reply(`❌ Źle! Spróbuj ponownie. (Próba ${game.attempts})`);
        }
      }
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('⏱️ Koniec czasu!')
          .setDescription(`Nie udało się! Odpowiedź to: **${game.question.answer}**\n${game.question.emoji}`);
        
        channel.send({ embeds: [timeoutEmbed] });
        client.games.delete(gameId);
      }
    });
  },
};
