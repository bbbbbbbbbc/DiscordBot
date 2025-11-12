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

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Daj reputację użytkownikowi')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik któremu chcesz dać reputację')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const giver = interaction.user;
      const target = interaction.options.getUser('użytkownik');

      if (target.id === giver.id) {
        return await interaction.reply({ content: '❌ Nie możesz dać sobie reputacji!', ephemeral: true });
      }

      if (target.bot) {
        return await interaction.reply({ content: '❌ Nie możesz dać reputacji botowi!', ephemeral: true });
      }

      const cooldownKey = giver.id;
      const lastUsed = cooldowns.get(cooldownKey);
      const cooldownTime = 12 * 60 * 60 * 1000; // 12 godzin

      if (lastUsed && Date.now() - lastUsed < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - (Date.now() - lastUsed)) / 1000 / 60 / 60);
        return await interaction.reply({ 
          content: `⏰ Możesz dać reputację za **${timeLeft}h**!`, 
          ephemeral: true 
        });
      }

      const social = getSocial();

      if (!social[target.id]) {
        social[target.id] = { rep: 0, badges: [], achievements: [], partner: null, pet: null };
      }

      social[target.id].rep = (social[target.id].rep || 0) + 1;
      saveSocial(social);
      cooldowns.set(cooldownKey, Date.now());

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('⭐ Reputacja')
        .setDescription(`${giver} dał reputację użytkownikowi ${target}!`)
        .addFields(
          { name: '📊 Aktualna reputacja', value: `${social[target.id].rep} ⭐` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie rep:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas dawania reputacji!', ephemeral: true });
    }
  },
};
