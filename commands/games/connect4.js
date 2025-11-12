const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const games = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect4')
    .setDescription('Zagraj w cztery w rzędzie! 🔴🟡')
    .addUserOption(option =>
      option.setName('przeciwnik')
        .setDescription('Wybierz przeciwnika')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const player1 = interaction.user;
    const player2 = isSlash ? interaction.options.getUser('przeciwnik') : interaction.mentions.users.first();

    if (!player2) {
      const msg = '❌ Musisz oznaczyć przeciwnika!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (player2.bot) {
      const msg = '❌ Nie możesz grać z botem!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (player1.id === player2.id) {
      const msg = '❌ Nie możesz grać sam ze sobą!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const gameId = `${player1.id}-${player2.id}`;
    
    const board = Array(6).fill(null).map(() => Array(7).fill('⚪'));
    
    games.set(gameId, {
      board,
      currentPlayer: player1.id,
      player1: player1.id,
      player2: player2.id
    });

    const boardDisplay = board.map(row => row.join('')).join('\n');
    const numbers = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🔴🟡 Cztery w Rzędzie')
      .setDescription(`**${player1.username}** (🔴) vs **${player2.username}** (🟡)\n\n${boardDisplay}\n${numbers}\n\n**Kolej:** ${player1.username} 🔴\n\nWpisz numer kolumny (1-7) aby zagrać!`)
      .setFooter({ text: 'Gra wygasa po 5 minutach nieaktywności' })
      .setTimestamp();

    setTimeout(() => {
      if (games.has(gameId)) {
        games.delete(gameId);
      }
    }, 300000);

    const msg = isSlash ? await interaction.reply({ embeds: [embed], fetchReply: true }) : await interaction.reply({ embeds: [embed] });
    
    const filter = m => {
      const game = games.get(gameId);
      if (!game) return false;
      return (m.author.id === game.currentPlayer) && /^[1-7]$/.test(m.content);
    };

    const collector = msg.channel.createMessageCollector({ filter, time: 300000 });

    collector.on('collect', async m => {
      const game = games.get(gameId);
      if (!game) return;

      const col = parseInt(m.content) - 1;
      
      for (let row = 5; row >= 0; row--) {
        if (game.board[row][col] === '⚪') {
          game.board[row][col] = game.currentPlayer === game.player1 ? '🔴' : '🟡';
          
          const winner = checkWinner(game.board);
          const boardDisplay = game.board.map(r => r.join('')).join('\n');
          
          if (winner) {
            const winnerUser = winner === '🔴' ? player1 : player2;
            const finalEmbed = new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('🏆 Koniec Gry!')
              .setDescription(`${boardDisplay}\n${numbers}\n\n**Zwycięzca:** ${winnerUser.username}!`)
              .setTimestamp();
            
            await m.channel.send({ embeds: [finalEmbed] });
            games.delete(gameId);
            collector.stop();
            return;
          }
          
          if (game.board.every(r => r.every(c => c !== '⚪'))) {
            const drawEmbed = new EmbedBuilder()
              .setColor('#FFFF00')
              .setTitle('🤝 Remis!')
              .setDescription(`${boardDisplay}\n${numbers}\n\nPlansza pełna - remis!`)
              .setTimestamp();
            
            await m.channel.send({ embeds: [drawEmbed] });
            games.delete(gameId);
            collector.stop();
            return;
          }
          
          game.currentPlayer = game.currentPlayer === game.player1 ? game.player2 : game.player1;
          const currentUser = game.currentPlayer === game.player1 ? player1 : player2;
          const currentEmoji = game.currentPlayer === game.player1 ? '🔴' : '🟡';
          
          const updateEmbed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🔴🟡 Cztery w Rzędzie')
            .setDescription(`**${player1.username}** (🔴) vs **${player2.username}** (🟡)\n\n${boardDisplay}\n${numbers}\n\n**Kolej:** ${currentUser.username} ${currentEmoji}`)
            .setTimestamp();
          
          await m.channel.send({ embeds: [updateEmbed] });
          break;
        }
      }
    });

    collector.on('end', () => {
      if (games.has(gameId)) {
        games.delete(gameId);
      }
    });
  },
};

function checkWinner(board) {
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = board[row][col];
      if (cell === '⚪') continue;
      
      if (col <= 3 && board[row][col+1] === cell && board[row][col+2] === cell && board[row][col+3] === cell) {
        return cell;
      }
      
      if (row <= 2 && board[row+1][col] === cell && board[row+2][col] === cell && board[row+3][col] === cell) {
        return cell;
      }
      
      if (row <= 2 && col <= 3 && board[row+1][col+1] === cell && board[row+2][col+2] === cell && board[row+3][col+3] === cell) {
        return cell;
      }
      
      if (row >= 3 && col <= 3 && board[row-1][col+1] === cell && board[row-2][col+2] === cell && board[row-3][col+3] === cell) {
        return cell;
      }
    }
  }
  return null;
}
