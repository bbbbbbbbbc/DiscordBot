const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('typerace')
    .setDescription('Wyścig pisania'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const texts = [
      'Szybkie pisanie to bardzo przydatna umiejętność',
      'Discord bot napisany w JavaScript',
      'Programowanie jest fascynujące',
      'Ćwicz pisanie każdego dnia',
      'Gry komputerowe to świetna rozrywka'
    ];

    const text = texts[Math.floor(Math.random() * texts.length)];
    const gameId = `type_${channel.id}`;

    if (client.games.has(gameId)) {
      const message = '❌ Gra już trwa na tym kanale!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    client.games.set(gameId, { text, startTime: Date.now() });
    const gameMessage = `⌨️ **Wyścig pisania!**\n\nPrzepisz dokładnie ten tekst:\n\`\`\`${text}\`\`\``;
    
    if (isSlash) {
      await interaction.reply(gameMessage);
    } else {
      channel.send(gameMessage);
    }

    const filter = m => !m.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      
      if (m.content === game.text) {
        const time = ((Date.now() - game.startTime) / 1000).toFixed(2);
        const wpm = Math.round((game.text.length / 5) / (time / 60));
        m.reply(`🏁 **Gratulacje!**\n⏱️ Czas: ${time}s\n📊 Prędkość: ${wpm} WPM\n🏆 Wygrywa: ${m.author}`);
        client.games.delete(gameId);
        collector.stop();
      }
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        channel.send('⏱️ Nikt nie ukończył wyścigu na czas!');
        client.games.delete(gameId);
      }
    });
  },
};
