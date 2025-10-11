const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shop',
  description: 'Zobacz dostępne przedmioty w sklepie',
  aliases: ['sklep', 'store'],
  async execute(message, args, client) {
    const shop = [
      { id: 'cookie', name: 'Ciastko', price: 100, emoji: '🍪', description: 'Pyszne ciastko' },
      { id: 'coffee', name: 'Kawa', price: 150, emoji: '☕', description: 'Energia na cały dzień' },
      { id: 'pizza', name: 'Pizza', price: 300, emoji: '🍕', description: 'Włoska uczta' },
      { id: 'trophy', name: 'Trofeum', price: 1000, emoji: '🏆', description: 'Symbol zwycięstwa' },
      { id: 'crown', name: 'Korona', price: 5000, emoji: '👑', description: 'Królewska korona' },
      { id: 'gem', name: 'Klejnot', price: 10000, emoji: '💎', description: 'Rzadki klejnot' },
    ];

    const embed = new EmbedBuilder()
      .setColor('#9C27B0')
      .setTitle('🏪 Sklep')
      .setDescription('Kup przedmioty używając !buy <id>\n\n**Dostępne przedmioty:**')
      .setFooter({ text: 'Użyj !buy <id> aby kupić przedmiot' })
      .setTimestamp();

    shop.forEach(item => {
      embed.addFields({
        name: `${item.emoji} ${item.name}`,
        value: `**ID:** \`${item.id}\`\n**Cena:** ${item.price} 🪙\n${item.description}`,
        inline: true
      });
    });

    message.reply({ embeds: [embed] });
  },
};
