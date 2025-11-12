const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memory')
    .setDescription('Gra Memory - znajdź pary emoji'),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const gameId = `memory_${channel.id}`;
    
    if (client.games.has(gameId)) {
      const message = '❌ Gra Memory już trwa na tym kanale!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const emojis = ['🍎', '🍌', '🍇', '🍊', '🍋', '🍉', '🍓', '🍒'];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    const revealed = new Array(16).fill(false);
    let firstCard = null;
    let matchedPairs = 0;
    let moves = 0;

    const createButtons = () => {
      const rows = [];
      for (let i = 0; i < 4; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 4; j++) {
          const index = i * 4 + j;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`memory_${index}`)
              .setLabel(revealed[index] ? cards[index] : '❓')
              .setStyle(revealed[index] ? ButtonStyle.Success : ButtonStyle.Primary)
              .setDisabled(revealed[index])
          );
        }
        rows.push(row);
      }
      return rows;
    };

    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('🎴 Memory - Znajdź pary!')
      .setDescription(`Kliknij karty aby znaleźć pary emoji\n\nRuchy: ${moves}\nZnalezione pary: ${matchedPairs}/8`)
      .setFooter({ text: `Gra: ${author.tag}` });

    let msg;
    if (isSlash) {
      await interaction.reply({ embeds: [embed], components: createButtons() });
      msg = await interaction.fetchReply();
    } else {
      msg = await channel.send({ embeds: [embed], components: createButtons() });
    }

    client.games.set(gameId, { cards, revealed, firstCard, matchedPairs, moves, msg });

    const collector = msg.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async buttonInteraction => {
      if (buttonInteraction.user.id !== author.id) {
        return buttonInteraction.reply({ content: '❌ To nie twoja gra!', ephemeral: true });
      }

      const game = client.games.get(gameId);
      const index = parseInt(buttonInteraction.customId.split('_')[1]);

      if (game.revealed[index]) {
        return buttonInteraction.reply({ content: '❌ Ta karta jest już odkryta!', ephemeral: true });
      }

      game.revealed[index] = true;

      if (game.firstCard === null) {
        game.firstCard = index;
        await buttonInteraction.update({ components: createButtons() });
      } else {
        game.moves++;
        
        if (game.cards[game.firstCard] === game.cards[index]) {
          game.matchedPairs++;
          game.firstCard = null;
          
          const updatedEmbed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🎴 Memory - Znajdź pary!')
            .setDescription(`✅ Znalazłeś parę!\n\nRuchy: ${game.moves}\nZnalezione pary: ${game.matchedPairs}/8`)
            .setFooter({ text: `Gra: ${author.tag}` });

          await buttonInteraction.update({ embeds: [updatedEmbed], components: createButtons() });

          if (game.matchedPairs === 8) {
            const winEmbed = new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('🎉 Wygrałeś!')
              .setDescription(`Gratulacje! Znalazłeś wszystkie pary w ${game.moves} ruchach!`)
              .setFooter({ text: `Gra: ${author.tag}` });
            
            await msg.edit({ embeds: [winEmbed], components: [] });
            client.games.delete(gameId);
            collector.stop();
          }
        } else {
          await buttonInteraction.update({ components: createButtons() });
          
          setTimeout(async () => {
            game.revealed[game.firstCard] = false;
            game.revealed[index] = false;
            game.firstCard = null;
            
            const updatedEmbed = new EmbedBuilder()
              .setColor('#FF69B4')
              .setTitle('🎴 Memory - Znajdź pary!')
              .setDescription(`❌ Nie ma pary!\n\nRuchy: ${game.moves}\nZnalezione pary: ${game.matchedPairs}/8`)
              .setFooter({ text: `Gra: ${author.tag}` });

            await msg.edit({ embeds: [updatedEmbed], components: createButtons() });
          }, 1500);
        }
      }
    });

    collector.on('end', () => {
      if (client.games.has(gameId)) {
        const game = client.games.get(gameId);
        const timeoutEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('⏱️ Koniec czasu!')
          .setDescription(`Gra zakończona.\nRuchy: ${game.moves}\nZnalezione pary: ${game.matchedPairs}/8`);
        
        msg.edit({ embeds: [timeoutEmbed], components: [] });
        client.games.delete(gameId);
      }
    });
  },
};
