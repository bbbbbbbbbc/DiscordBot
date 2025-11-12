const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const socialPath = path.join(__dirname, '../../data/social.json');

function getSocial() {
  if (!fs.existsSync(socialPath)) {
    fs.writeFileSync(socialPath, '{}');
  }
  return JSON.parse(fs.readFileSync(socialPath, 'utf8'));
}

function saveSocial(social) {
  fs.writeFileSync(socialPath, JSON.stringify(social, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('Rozwiedź się z partnerem'),
  
  async execute(interaction) {
    try {
      const user = interaction.user;
      const social = getSocial();

      if (!social[user.id] || !social[user.id].partner) {
        return await interaction.reply({ content: '❌ Nie jesteś w związku!', ephemeral: true });
      }

      const partnerId = social[user.id].partner;
      
      social[user.id].partner = null;
      if (social[partnerId]) {
        social[partnerId].partner = null;
      }

      saveSocial(social);

      const embed = new EmbedBuilder()
        .setColor('#808080')
        .setTitle('💔 Rozwód')
        .setDescription(`${user} i <@${partnerId}> są już po rozwodzie...`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie divorce:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas rozwodu!', ephemeral: true });
    }
  },
};
