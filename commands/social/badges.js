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

const availableBadges = {
  '🌟': 'Nowicjusz',
  '⭐': 'Aktywny',
  '💎': 'Premium',
  '👑': 'VIP',
  '🔥': 'Gorący',
  '💪': 'Silny',
  '🎯': 'Celny',
  '🏆': 'Mistrz',
  '🎖️': 'Weteran',
  '⚡': 'Błyskawiczny'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('badges')
    .setDescription('Wyświetl odznaki użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego odznaki chcesz zobaczyć')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('użytkownik') || interaction.user;
      const social = getSocial();

      if (!social[target.id]) {
        social[target.id] = { rep: 0, badges: ['🌟'], achievements: [], partner: null, pet: null };
        fs.writeFileSync(socialPath, JSON.stringify(social, null, 2));
      }

      const userData = social[target.id];
      const userBadges = userData.badges || ['🌟'];

      const badgeList = userBadges.map(badge => {
        const name = availableBadges[badge] || 'Nieznana';
        return `${badge} **${name}**`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setColor('#E91E63')
        .setTitle(`🏅 Odznaki ${target.username}`)
        .setDescription(badgeList || 'Brak odznak')
        .addFields(
          { name: '📊 Statystyki', value: `Łącznie: **${userBadges.length}** odznak` }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie badges:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wyświetlania odznak!', ephemeral: true });
    }
  },
};
