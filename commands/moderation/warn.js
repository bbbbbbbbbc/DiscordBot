const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFile = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsFile)) {
    fs.writeFileSync(warningsFile, JSON.stringify({}));
    return {};
  }
  return JSON.parse(fs.readFileSync(warningsFile, 'utf-8'));
}

function saveWarnings(warnings) {
  fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Ostrzeż użytkownika')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do ostrzeżenia')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powod')
        .setDescription('Powód ostrzeżenia')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      const msg = '❌ Nie masz uprawnień do ostrzegania użytkowników!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const user = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();
    const reason = isSlash ? interaction.options.getString('powod') : interaction.content.split(' ').slice(2).join(' ');

    if (!user) {
      const msg = '❌ Musisz oznaczyć użytkownika do ostrzeżenia!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    if (!reason) {
      const msg = '❌ Musisz podać powód ostrzeżenia!';
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const warnings = loadWarnings();
    const guildId = interaction.guild.id;
    const userId = user.id;

    if (!warnings[guildId]) {
      warnings[guildId] = {};
    }

    if (!warnings[guildId][userId]) {
      warnings[guildId][userId] = [];
    }

    const warning = {
      reason: reason,
      moderator: interaction.user.tag,
      date: new Date().toISOString(),
    };

    warnings[guildId][userId].push(warning);
    saveWarnings(warnings);

    const warnCount = warnings[guildId][userId].length;

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⚠️ Ostrzeżenie')
      .setDescription(`**${user.tag}** otrzymał ostrzeżenie!`)
      .addFields(
        { name: '📝 Powód', value: reason },
        { name: '👮 Moderator', value: interaction.user.tag },
        { name: '🔢 Liczba ostrzeżeń', value: `${warnCount}` }
      )
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
    } catch (error) {
      console.log('Nie można wysłać wiadomości prywatnej do użytkownika');
    }

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
