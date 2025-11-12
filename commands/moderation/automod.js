const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
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
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('[ADMIN] Włącz/wyłącz automatyczną moderację')
    .addStringOption(option =>
      option.setName('akcja')
        .setDescription('Akcja do wykonania')
        .setRequired(false)
        .addChoices(
          { name: 'Włącz', value: 'on' },
          { name: 'Wyłącz', value: 'off' },
          { name: 'Status', value: 'status' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const guild = isSlash ? interaction.guild : interaction.guild;

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      const message = '❌ Musisz być administratorem aby użyć tej komendy!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const config = getConfig();
    const guildId = guild.id;

    if (!config[guildId]) {
      config[guildId] = { enabled: false, antiSpam: true, antiProfanity: true };
    }

    let action;
    if (isSlash) {
      action = interaction.options.getString('akcja');
    } else {
      action = args[0];
    }

    if (!action) {
      const status = config[guildId].enabled ? '✅ Włączona' : '❌ Wyłączona';
      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('⚙️ Automoderacja')
        .addFields(
          { name: 'Status', value: status, inline: true },
          { name: 'Anti-Spam', value: config[guildId].antiSpam ? '✅' : '❌', inline: true },
          { name: 'Filtr Wulgaryzmów', value: config[guildId].antiProfanity ? '✅' : '❌', inline: true }
        )
        .setDescription('Użyj: /automod <on/off>')
        .setTimestamp();

      if (isSlash) {
        return await interaction.reply({ embeds: [embed] });
      } else {
        return interaction.reply({ embeds: [embed] });
      }
    }

    const actionLower = action.toLowerCase();

    if (actionLower === 'on' || actionLower === 'enable' || actionLower === 'włącz' || actionLower === 'status') {
      if (actionLower !== 'status') {
        config[guildId].enabled = true;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      }

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Automoderacja Włączona')
        .setDescription('Automatyczna moderacja jest teraz aktywna!')
        .addFields(
          { name: 'Anti-Spam', value: '✅ Aktywne', inline: true },
          { name: 'Filtr Wulgaryzmów', value: '✅ Aktywny', inline: true }
        )
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply({ embeds: [embed] });
      }
    } else if (actionLower === 'off' || actionLower === 'disable' || actionLower === 'wyłącz') {
      config[guildId].enabled = false;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Automoderacja Wyłączona')
        .setDescription('Automatyczna moderacja została wyłączona')
        .setTimestamp();

      if (isSlash) {
        await interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply({ embeds: [embed] });
      }
    } else {
      const message = '❌ Użyj: /automod <on/off>';
      if (isSlash) {
        await interaction.reply(message);
      } else {
        interaction.reply(message);
      }
    }
  },
};
