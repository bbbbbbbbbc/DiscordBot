const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const tempbansPath = path.join(__dirname, '../../data/tempbans.json');

function getTempbans() {
  if (!fs.existsSync(tempbansPath)) {
    fs.writeFileSync(tempbansPath, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(tempbansPath, 'utf8'));
}

function saveTempbans(tempbans) {
  fs.writeFileSync(tempbansPath, JSON.stringify(tempbans, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Banuje użytkownika czasowo')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do zbanowania')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('czas')
        .setDescription('Czas bana w dniach (maksymalnie 365 dni)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(365)
    )
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód bana')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return await interaction.reply({ content: '❌ Nie masz uprawnień do banowania użytkowników!', ephemeral: true });
      }

      const user = interaction.options.getUser('użytkownik');
      const days = interaction.options.getInteger('czas');
      const reason = interaction.options.getString('powód') || 'Nie podano powodu';

      const targetMember = interaction.guild.members.cache.get(user.id);

      if (!targetMember) {
        return await interaction.reply({ content: '❌ Nie można znaleźć tego użytkownika na serwerze!', ephemeral: true });
      }

      if (!targetMember.bannable) {
        return await interaction.reply({ content: '❌ Nie mogę zbanować tego użytkownika!', ephemeral: true });
      }

      await targetMember.ban({ reason: `${reason} (Ban czasowy: ${days} dni)` });

      const tempbans = getTempbans();
      const unbanTime = Date.now() + (days * 24 * 60 * 60 * 1000);
      
      tempbans.push({
        userId: user.id,
        guildId: interaction.guild.id,
        userTag: user.tag,
        unbanTime: unbanTime,
        reason: reason,
        bannedBy: interaction.user.tag,
        days: days
      });
      
      saveTempbans(tempbans);

      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('⏰ Czasowy Ban')
        .setDescription(`${user.tag} został zbanowany na **${days} dni**`)
        .addFields(
          { name: 'Użytkownik', value: user.tag, inline: true },
          { name: 'Czas', value: `${days} dni`, inline: true },
          { name: 'Powód', value: reason, inline: false },
          { name: 'Zbanowany przez', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie tempban:', error);
      await interaction.reply({ content: '❌ Nie udało się zbanować użytkownika!', ephemeral: true });
    }
  },
};
