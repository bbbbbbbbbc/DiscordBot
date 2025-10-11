const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vote',
  description: 'Szybkie głosowanie tak/nie',
  aliases: ['yesno', 'glosowanie'],
  async execute(message, args, client) {
    if (args.length === 0) {
      return message.reply('❌ Podaj pytanie do głosowania!\nPrzykład: !vote Czy lubicie pizzę?');
    }

    const question = args.join(' ');

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🗳️ Głosowanie')
      .setDescription(`**${question}**\n\n✅ - Tak\n❌ - Nie`)
      .setFooter({ text: `Głosowanie od ${message.author.tag}` })
      .setTimestamp();

    const voteMessage = await message.channel.send({ embeds: [embed] });

    await voteMessage.react('✅');
    await voteMessage.react('❌');

    message.delete().catch(() => {});
  },
};
