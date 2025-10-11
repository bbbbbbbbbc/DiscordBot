const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'poll',
  description: 'Stwórz ankietę',
  aliases: ['ankieta', 'vote'],
  async execute(message, args, client) {
    if (args.length < 3) {
      return message.reply('❌ Użyj: !poll <pytanie> | <opcja1> | <opcja2> | ...\nPrzykład: !poll Ulubiony kolor? | Czerwony | Niebieski | Zielony');
    }

    const pollData = args.join(' ').split('|').map(s => s.trim());
    
    if (pollData.length < 3) {
      return message.reply('❌ Ankieta musi mieć pytanie i przynajmniej 2 opcje!');
    }

    const question = pollData[0];
    const options = pollData.slice(1);

    if (options.length > 10) {
      return message.reply('❌ Maksymalnie 10 opcji!');
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('📊 Ankieta')
      .setDescription(`**${question}**\n\n${options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n')}`)
      .setFooter({ text: `Ankieta od ${message.author.tag}` })
      .setTimestamp();

    const pollMessage = await message.channel.send({ embeds: [embed] });

    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(emojis[i]);
    }

    message.delete().catch(() => {});
  },
};
