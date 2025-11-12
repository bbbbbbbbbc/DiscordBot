const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const socialPath = path.join(__dirname, '../../data/social.json');
const economyPath = path.join(__dirname, '../../data/economy.json');

function getSocial() {
  if (!fs.existsSync(socialPath)) {
    fs.writeFileSync(socialPath, '{}');
  }
  return JSON.parse(fs.readFileSync(socialPath, 'utf8'));
}

function getEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}');
  }
  return JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Wyświetl profil użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego profil chcesz zobaczyć')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('użytkownik') || interaction.user;
      const social = getSocial();
      const economy = getEconomy();

      if (!social[target.id]) {
        social[target.id] = { 
          rep: 0, 
          badges: [], 
          achievements: [],
          partner: null,
          pet: null
        };
        fs.writeFileSync(socialPath, JSON.stringify(social, null, 2));
      }

      if (!economy[target.id]) {
        economy[target.id] = { balance: 0, bank: 0, inventory: [] };
      }

      const userData = social[target.id];
      const economyData = economy[target.id];

      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle(`📋 Profil ${target.username}`)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
          { name: '⭐ Reputacja', value: `${userData.rep || 0}`, inline: true },
          { name: '💰 Gotówka', value: `${economyData.balance} 🪙`, inline: true },
          { name: '🏦 Bank', value: `${economyData.bank} 🪙`, inline: true },
          { name: '🏅 Odznaki', value: userData.badges.length > 0 ? userData.badges.join(' ') : 'Brak', inline: true },
          { name: '🎯 Osiągnięcia', value: `${userData.achievements.length}`, inline: true },
          { name: '💍 Partner', value: userData.partner ? `<@${userData.partner}>` : 'Brak', inline: true },
          { name: '🐾 Zwierzak', value: userData.pet || 'Brak', inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie profile:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wyświetlania profilu!', ephemeral: true });
    }
  },
};
