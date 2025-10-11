const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filterPath = path.join(__dirname, '../../data/filter.json');

function getFilter() {
  if (!fs.existsSync(filterPath)) {
    const defaultFilter = {
      words: ['kurwa', 'chuj', 'dupek', 'idiota', 'debil']
    };
    fs.writeFileSync(filterPath, JSON.stringify(defaultFilter, null, 2));
  }
  return JSON.parse(fs.readFileSync(filterPath, 'utf8'));
}

module.exports = {
  name: 'filter',
  description: '[ADMIN] Zarządzaj filtrem słów',
  aliases: ['wordfilter', 'badwords'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Musisz być administratorem aby użyć tej komendy!');
    }

    const filter = getFilter();

    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🚫 Filtr Słów')
        .setDescription(`**Zbanowane słowa (${filter.words.length}):**\n${filter.words.map(w => `\`${w}\``).join(', ')}`)
        .addFields(
          { name: 'Dodaj słowo', value: '!filter add <słowo>' },
          { name: 'Usuń słowo', value: '!filter remove <słowo>' },
          { name: 'Lista słów', value: '!filter list' }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    const action = args[0].toLowerCase();
    const word = args[1]?.toLowerCase();

    if (action === 'add' || action === 'dodaj') {
      if (!word) {
        return message.reply('❌ Podaj słowo do dodania!');
      }

      if (filter.words.includes(word)) {
        return message.reply('❌ To słowo jest już w filtrze!');
      }

      filter.words.push(word);
      fs.writeFileSync(filterPath, JSON.stringify(filter, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Dodano słowo')
        .setDescription(`Słowo \`${word}\` zostało dodane do filtra`)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } else if (action === 'remove' || action === 'usuń') {
      if (!word) {
        return message.reply('❌ Podaj słowo do usunięcia!');
      }

      const index = filter.words.indexOf(word);
      if (index === -1) {
        return message.reply('❌ To słowo nie jest w filtrze!');
      }

      filter.words.splice(index, 1);
      fs.writeFileSync(filterPath, JSON.stringify(filter, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Usunięto słowo')
        .setDescription(`Słowo \`${word}\` zostało usunięte z filtra`)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } else if (action === 'list' || action === 'lista') {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🚫 Filtr Słów - Lista')
        .setDescription(`**Zbanowane słowa (${filter.words.length}):**\n\n${filter.words.map(w => `• \`${w}\``).join('\n')}`)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } else {
      message.reply('❌ Użyj: !filter <add/remove/list> [słowo]');
    }
  },
};
