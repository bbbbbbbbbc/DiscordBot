const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guess')
    .setDescription('Zgadnij liczbę od 1 do 100'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const number = Math.floor(Math.random() * 100) + 1;
    const gameId = `guess_${channel.id}`;
    
    if (client.games.has(gameId)) {
      const message = '❌ Gra już trwa na tym kanale!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    client.games.set(gameId, { number, attempts: 0 });
    const gameMessage = '🎲 **Zgadywanka!** Zgadnij liczbę od 1 do 100! Masz 10 prób. Wpisz liczbę aby zgadywać.';
    
    if (isSlash) {
      await interaction.reply(gameMessage);
    } else {
      channel.send(gameMessage);
    }

    const filter = m => !m.author.bot && !isNaN(m.content);
    const collector = channel.createMessageCollector({ filter, time: 60000, max: 10 });

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
        channel.send(`⏱️ Koniec czasu! Liczba to: ${game.number}`);
        client.games.delete(gameId);
      }
    });
  },
};
