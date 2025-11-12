const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wordchain')
    .setDescription('Łańcuch słów - każde słowo zaczyna się ostatnią literą poprzedniego'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const gameId = `chain_${channel.id}`;
    
    if (client.games.has(gameId)) {
      const message = '❌ Gra już trwa na tym kanale!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const startWords = ['kot', 'dom', 'las', 'ser', 'rok', 'noc'];
    const currentWord = startWords[Math.floor(Math.random() * startWords.length)];
    const usedWords = new Set([currentWord]);

    client.games.set(gameId, { currentWord, usedWords });

    const gameMessage = `🔗 **Łańcuch słów!**\n\nPierwsze słowo: **${currentWord}**\n\nPodaj słowo zaczynające się na literę: **${currentWord.slice(-1).toUpperCase()}**\n\n(Masz 30 sekund między słowami)`;
    
    if (isSlash) {
      await interaction.reply(gameMessage);
    } else {
      channel.send(gameMessage);
    }

    const filter = m => !m.author.bot && /^[a-ząćęłńóśźż]+$/i.test(m.content);
    const collector = channel.createMessageCollector({ filter, idle: 30000 });

    collector.on('collect', m => {
      const game = client.games.get(gameId);
      const word = m.content.toLowerCase().trim();
      const lastLetter = game.currentWord.slice(-1);

      if (!word.startsWith(lastLetter)) {
        return m.reply(`❌ Słowo musi zaczynać się na literę **${lastLetter.toUpperCase()}**!`);
      }

      if (game.usedWords.has(word)) {
        return m.reply('❌ To słowo już było użyte!');
      }

      game.usedWords.add(word);
      game.currentWord = word;
      
      const nextLetter = word.slice(-1).toUpperCase();
      m.reply(`✅ Dobrze! Następne słowo na: **${nextLetter}**`);
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        channel.send(`🏁 Koniec gry! Użyto ${game.usedWords.size} słów!`);
        client.games.delete(gameId);
      }
    });
  },
};
