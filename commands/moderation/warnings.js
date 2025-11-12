const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFile = path.join(__dirname, '..', '..', 'data', 'warnings.json');

function loadWarnings() {
  if (!fs.existsSync(warningsFile)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(warningsFile, 'utf-8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Zobacz ostrzeżenia użytkownika')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do sprawdzenia')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const user = isSlash ? (interaction.options.getUser('user') || interaction.user) : (interaction.mentions.users.first() || interaction.user);

    const warnings = loadWarnings();
    const guildId = interaction.guild.id;
    const userId = user.id;

    const userWarnings = warnings[guildId]?.[userId] || [];

    if (userWarnings.length === 0) {
      const msg = `✅ **${user.tag}** nie ma żadnych ostrzeżeń!`;
      return isSlash ? await interaction.reply(msg) : interaction.reply(msg);
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`⚠️ Ostrzeżenia użytkownika ${user.tag}`)
      .setDescription(`Liczba ostrzeżeń: **${userWarnings.length}**`)
      .setTimestamp();

    userWarnings.forEach((warn, index) => {
      const date = new Date(warn.date).toLocaleString('pl-PL');
      embed.addFields({
        name: `#${index + 1} - ${date}`,
        value: `📝 Powód: ${warn.reason}\n👮 Moderator: ${warn.moderator}`,
        inline: false
      });
    });

    isSlash ? await interaction.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
