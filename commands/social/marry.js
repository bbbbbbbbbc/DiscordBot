const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    .setName('marry')
    .setDescription('Zaproponuj ślub użytkownikowi')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik któremu chcesz zaproponować ślub')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      const proposer = interaction.user;
      const target = interaction.options.getUser('użytkownik');

      if (target.id === proposer.id) {
        return await interaction.reply({ content: '❌ Nie możesz poślubić samego siebie!', ephemeral: true });
      }

      if (target.bot) {
        return await interaction.reply({ content: '❌ Nie możesz poślubić bota!', ephemeral: true });
      }

      const social = getSocial();

      if (!social[proposer.id]) {
        social[proposer.id] = { rep: 0, badges: [], achievements: [], partner: null, pet: null };
      }
      if (!social[target.id]) {
        social[target.id] = { rep: 0, badges: [], achievements: [], partner: null, pet: null };
      }

      if (social[proposer.id].partner) {
        return await interaction.reply({ content: '❌ Jesteś już w związku!', ephemeral: true });
      }

      if (social[target.id].partner) {
        return await interaction.reply({ content: '❌ Ta osoba jest już w związku!', ephemeral: true });
      }

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('accept_marry')
            .setLabel('Akceptuję ❤️')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('decline_marry')
            .setLabel('Odrzucam')
            .setStyle(ButtonStyle.Danger)
        );

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('💍 Propozycja Małżeństwa')
        .setDescription(`${proposer} proponuje ślub użytkownikowi ${target}!\n\n💕 Co odpowiesz?`)
        .setTimestamp();

      const response = await interaction.reply({ 
        content: `${target}`,
        embeds: [embed], 
        components: [row] 
      });

      const filter = i => i.user.id === target.id;
      const collector = response.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        if (i.customId === 'accept_marry') {
          social[proposer.id].partner = target.id;
          social[target.id].partner = proposer.id;
          
          if (!social[proposer.id].achievements.includes('married')) {
            social[proposer.id].achievements.push('married');
          }
          if (!social[target.id].achievements.includes('married')) {
            social[target.id].achievements.push('married');
          }
          
          saveSocial(social);

          const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('💒 Wesele!')
            .setDescription(`${proposer} i ${target} są teraz małżeństwem! 🎉💕`)
            .setTimestamp();

          await i.update({ embeds: [successEmbed], components: [] });
        } else {
          const declineEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('💔 Odrzucono')
            .setDescription(`${target} odrzucił/a propozycję małżeństwa...`)
            .setTimestamp();

          await i.update({ embeds: [declineEmbed], components: [] });
        }
        collector.stop();
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏰ Czas minął')
            .setDescription('Propozycja małżeństwa wygasła...')
            .setTimestamp();

          interaction.editReply({ embeds: [timeoutEmbed], components: [] });
        }
      });
    } catch (error) {
      console.error('Błąd w komendzie marry:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas propozycji małżeństwa!', ephemeral: true });
    }
  },
};
