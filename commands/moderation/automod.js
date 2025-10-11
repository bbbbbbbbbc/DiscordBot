const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../data/automod.json');

function getConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '{}');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
  name: 'automod',
  description: '[ADMIN] Włącz/wyłącz automatyczną moderację',
  aliases: ['automoderation'],
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Musisz być administratorem aby użyć tej komendy!');
    }

    const config = getConfig();
    const guildId = message.guild.id;

    if (!config[guildId]) {
      config[guildId] = { enabled: false, antiSpam: true, antiProfanity: true };
    }

    if (!args[0]) {
      const status = config[guildId].enabled ? '✅ Włączona' : '❌ Wyłączona';
      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('⚙️ Automoderacja')
        .addFields(
          { name: 'Status', value: status, inline: true },
          { name: 'Anti-Spam', value: config[guildId].antiSpam ? '✅' : '❌', inline: true },
          { name: 'Filtr Wulgaryzmów', value: config[guildId].antiProfanity ? '✅' : '❌', inline: true }
        )
        .setDescription('Użyj: !automod <on/off>')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    const action = args[0].toLowerCase();

    if (action === 'on' || action === 'enable' || action === 'włącz') {
      config[guildId].enabled = true;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Automoderacja Włączona')
        .setDescription('Automatyczna moderacja jest teraz aktywna!')
        .addFields(
          { name: 'Anti-Spam', value: '✅ Aktywne', inline: true },
          { name: 'Filtr Wulgaryzmów', value: '✅ Aktywny', inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } else if (action === 'off' || action === 'disable' || action === 'wyłącz') {
      config[guildId].enabled = false;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Automoderacja Wyłączona')
        .setDescription('Automatyczna moderacja została wyłączona')
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } else {
      message.reply('❌ Użyj: !automod <on/off>');
    }
  },
};
