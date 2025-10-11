const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tictactoe',
  description: 'Gra w kółko i krzyżyk',
  aliases: ['ttt'],
  async execute(message, args, client) {
    const opponent = message.mentions.users.first();
    if (!opponent || opponent.id === message.author.id) {
      return message.reply('❌ Oznacz przeciwnika! Użyj: `!tictactoe @użytkownik`');
    }

    const gameId = `ttt_${message.channel.id}`;
    if (client.games.has(gameId)) {
      return message.reply('❌ Gra już trwa na tym kanale!');
    }

    const board = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
    const players = [message.author, opponent];
    let currentPlayer = 0;

    client.games.set(gameId, { board, players, currentPlayer });

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎮 Kółko i Krzyżyk')
      .setDescription(`${board[0]} ${board[1]} ${board[2]}\n${board[3]} ${board[4]} ${board[5]}\n${board[6]} ${board[7]} ${board[8]}\n\n${players[currentPlayer]} - wpisz numer (1-9)!`)
      .setFooter({ text: 'Masz 30 sekund na ruch!' });

    const gameMsg = await message.channel.send({ embeds: [embed] });

    const filter = m => players.some(p => p.id === m.author.id) && !isNaN(m.content) && m.content >= 1 && m.content <= 9;
    const collector = message.channel.createMessageCollector({ filter, time: 120000 });

    collector.on('collect', async m => {
      const game = client.games.get(gameId);
      if (m.author.id !== game.players[game.currentPlayer].id) return;

      const pos = parseInt(m.content) - 1;
      if (game.board[pos] === '❌' || game.board[pos] === '⭕') {
        return m.reply('❌ To pole jest zajęte!').then(msg => setTimeout(() => msg.delete(), 2000));
      }

      game.board[pos] = game.currentPlayer === 0 ? '❌' : '⭕';

      const winner = checkWinner(game.board);
      if (winner) {
        const winEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🏆 Koniec gry!')
          .setDescription(`${game.board[0]} ${game.board[1]} ${game.board[2]}\n${game.board[3]} ${game.board[4]} ${game.board[5]}\n${game.board[6]} ${game.board[7]} ${game.board[8]}\n\n🎉 Wygrywa: ${game.players[game.currentPlayer]}!`);
        
        await gameMsg.edit({ embeds: [winEmbed] });
        client.games.delete(gameId);
        collector.stop();
        return;
      }

      if (!game.board.some(cell => !['❌', '⭕'].includes(cell))) {
        const drawEmbed = new EmbedBuilder()
          .setColor('#FFFF00')
          .setTitle('🤝 Remis!')
          .setDescription(`${game.board[0]} ${game.board[1]} ${game.board[2]}\n${game.board[3]} ${game.board[4]} ${game.board[5]}\n${game.board[6]} ${game.board[7]} ${game.board[8]}\n\nNikt nie wygrał!`);
        
        await gameMsg.edit({ embeds: [drawEmbed] });
        client.games.delete(gameId);
        collector.stop();
        return;
      }

      game.currentPlayer = game.currentPlayer === 0 ? 1 : 0;

      const updateEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎮 Kółko i Krzyżyk')
        .setDescription(`${game.board[0]} ${game.board[1]} ${game.board[2]}\n${game.board[3]} ${game.board[4]} ${game.board[5]}\n${game.board[6]} ${game.board[7]} ${game.board[8]}\n\n${game.players[game.currentPlayer]} - wpisz numer (1-9)!`);

      await gameMsg.edit({ embeds: [updateEmbed] });
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        message.channel.send('⏱️ Gra zakończona - upłynął czas!');
        client.games.delete(gameId);
      }
    });
  },
};

function checkWinner(board) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  
  for (const [a,b,c] of wins) {
    if (board[a] === board[b] && board[b] === board[c] && ['❌','⭕'].includes(board[a])) {
      return true;
    }
  }
  return false;
}
