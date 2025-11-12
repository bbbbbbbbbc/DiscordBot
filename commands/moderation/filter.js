const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
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
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('[ADMIN] Zarządzaj filtrem słów')
    .addStringOption(option =>
      option.setName('akcja')
        .setDescription('Akcja do wykonania')
        .setRequired(false)
        .addChoices(
          { name: 'Dodaj słowo', value: 'add' },
          { name: 'Usuń słowo', value: 'remove' },
          { name: 'Pokaż listę', value: 'list' }
        )
    )
    .addStringOption(option =>
      option.setName('słowo')
        .setDescription('Słowo do dodania/usunięcia')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      const message = '❌ Musisz być administratorem aby użyć tej komendy!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const filter = getFilter();

    let action, word;
    if (isSlash) {
      action = interaction.options.getString('akcja');
      word = interaction.options.getString('słowo')?.toLowerCase();
    } else {
      action = args[0];
      word = args[1]?.toLowerCase();
    }

    if (!action) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🚫 Filtr Słów')
        .setDescription(`**Zbanowane słowa (${filter.words.length}):**\n${filter.words.map(w => `\`${w}\``).join(', ')}`)
        .addFields(
          { name: 'Dodaj słowo', value: '/filter add <słowo>' },
          { name: 'Usuń słowo', value: '/filter remove <słowo>' },
          { name: 'Lista słów', value: '/filter list' }
        )
        .setTimestamp();

      if (isSlash) {
        return await interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply({ embeds: [embed] });
      }
    }

    const actionLower = action.toLowerCase();

    if (actionLower === 'add' || actionLower === 'dodaj') {
      if (!word) {
        const message = '❌ Podaj słowo do dodania!';
        if (isSlash) {
          return await interaction.reply(message);
        } else {
          return interaction.reply(message);
        }
      }

      if (filter.words.includes(word)) {
        const message = '❌ To słowo jest już w filtrze!';
        if (isSlash) {
          return await interaction.reply(message);
        } else {
          return interaction.reply(message);
        }
      }

      filter.words.push(word);
      fs.writeFileSync(filterPath, JSON.stringify(filter, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Dodano słowo')
        .setDescription(`Słowo \`${word}\` zostało dodane do filtra`)
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply({ embeds: [embed] });
      }
    } else if (actionLower === 'remove' || actionLower === 'usuń') {
      if (!word) {
        const message = '❌ Podaj słowo do usunięcia!';
        if (isSlash) {
          return await interaction.reply(message);
        } else {
          return interaction.reply(message);
        }
      }

      const index = filter.words.indexOf(word);
      if (index === -1) {
        const message = '❌ To słowo nie jest w filtrze!';
        if (isSlash) {
          return await interaction.reply(message);
        } else {
          return interaction.reply(message);
        }
      }

      filter.words.splice(index, 1);
      fs.writeFileSync(filterPath, JSON.stringify(filter, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Usunięto słowo')
        .setDescription(`Słowo \`${word}\` zostało usunięte z filtra`)
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply({ embeds: [embed] });
      }
    } else if (actionLower === 'list' || actionLower === 'lista') {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🚫 Filtr Słów - Lista')
        .setDescription(`**Zbanowane słowa (${filter.words.length}):**\n\n${filter.words.map(w => `• \`${w}\``).join('\n')}`)
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply({ embeds: [embed] });
      }
    } else {
      const message = '❌ Użyj: /filter <add/remove/list> [słowo]';
      if (isSlash) {
        await interaction.reply(message);
      } else {
        interaction.reply(message);
      }
    }
  },
};
