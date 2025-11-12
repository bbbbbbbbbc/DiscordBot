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

const availableAchievements = [
  { id: 'first_win', name: '🎯 Pierwsza Wygrana', desc: 'Wygraj pierwszą grę' },
  { id: 'rich', name: '💰 Bogacz', desc: 'Zgromadź 10,000 monet' },
  { id: 'married', name: '💍 Szczęśliwy Małżonek', desc: 'Weź ślub' },
  { id: 'social', name: '👥 Towarzyski', desc: 'Uzyskaj 50 reputacji' },
  { id: 'gambler', name: '🎰 Hazardzista', desc: 'Zagraj 100 razy' },
  { id: 'collector', name: '📦 Kolekcjoner', desc: 'Zdobądź 20 przedmiotów' },
  { id: 'helpful', name: '🤝 Pomocny', desc: 'Pomóż 25 użytkownikom' },
  { id: 'active', name: '⚡ Aktywny', desc: 'Bądź aktywny przez 30 dni' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription('Wyświetl osiągnięcia użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego osiągnięcia chcesz zobaczyć')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    try {
      const target = interaction.options.getUser('użytkownik') || interaction.user;
      const social = getSocial();

      if (!social[target.id]) {
        social[target.id] = { rep: 0, badges: [], achievements: [], partner: null, pet: null };
        fs.writeFileSync(socialPath, JSON.stringify(social, null, 2));
      }

      const userData = social[target.id];
      const userAchievements = userData.achievements || [];

      const achievementList = availableAchievements.map(ach => {
        const unlocked = userAchievements.includes(ach.id);
        return `${unlocked ? '✅' : '🔒'} ${ach.name}\n${ach.desc}`;
      }).join('\n\n');

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🎯 Osiągnięcia ${target.username}`)
        .setDescription(achievementList)
        .addFields(
          { name: '📊 Postęp', value: `${userAchievements.length}/${availableAchievements.length} odblokowanych` }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie achievements:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas wyświetlania osiągnięć!', ephemeral: true });
    }
  },
};
