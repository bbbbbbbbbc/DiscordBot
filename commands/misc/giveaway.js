const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Rozpocznij giveaway')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('nagroda')
        .setDescription('Nagroda do wygrania')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('czas')
        .setDescription('Czas trwania w minutach')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1440)
    )
    .addIntegerOption(option =>
      option.setName('zwycięzcy')
        .setDescription('Liczba zwycięzców')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),
  
  async execute(interaction) {
    try {
      const prize = interaction.options.getString('nagroda');
      const duration = interaction.options.getInteger('czas');
      const winners = interaction.options.getInteger('zwycięzcy') || 1;

      const endTime = Date.now() + (duration * 60 * 1000);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 GIVEAWAY!')
        .setDescription(`**Nagroda:** ${prize}\n\n**Zwycięzców:** ${winners}\n**Koniec:** <t:${Math.floor(endTime / 1000)}:R>`)
        .addFields(
          { name: '📝 Jak wziąć udział?', value: 'Kliknij 🎉 poniżej!' }
        )
        .setFooter({ text: `Organizator: ${interaction.user.tag}` })
        .setTimestamp(endTime);

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });
      await message.react('🎉');

      setTimeout(async () => {
        try {
          const reactionMessage = await interaction.channel.messages.fetch(message.id);
          const reaction = reactionMessage.reactions.cache.get('🎉');
          
          if (!reaction) return;

          const users = await reaction.users.fetch();
          const participants = users.filter(user => !user.bot);

          if (participants.size === 0) {
            const noWinnerEmbed = new EmbedBuilder()
              .setColor('#E74C3C')
              .setTitle('🎉 Giveaway Zakończony')
              .setDescription(`**Nagroda:** ${prize}\n\n❌ Brak uczestników!`)
              .setTimestamp();

            return await interaction.followUp({ embeds: [noWinnerEmbed] });
          }

          const winnersArray = participants.random(Math.min(winners, participants.size));
          const winnersList = Array.isArray(winnersArray) ? winnersArray : [winnersArray];

          const winnerEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🎉 Giveaway Zakończony!')
            .setDescription(`**Nagroda:** ${prize}\n\n**Zwycięzcy:**\n${winnersList.map(w => `${w}`).join('\n')}`)
            .setTimestamp();

          await interaction.followUp({ 
            content: `Gratulacje ${winnersList.join(', ')}!`, 
            embeds: [winnerEmbed] 
          });
        } catch (error) {
          console.error('Błąd przy losowaniu zwycięzców:', error);
        }
      }, duration * 60 * 1000);

    } catch (error) {
      console.error('Błąd w komendzie giveaway:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas tworzenia giveaway!', ephemeral: true });
    }
  },
};
