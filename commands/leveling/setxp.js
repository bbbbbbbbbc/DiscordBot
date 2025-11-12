const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../../data/levels.json');

function getLevels() {
  if (!fs.existsSync(levelsPath)) {
    fs.writeFileSync(levelsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
}

function getLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setxp')
    .setDescription('[ADMIN] Ustaw XP użytkownikowi')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik któremu chcesz ustawić XP')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('xp')
        .setDescription('Ilość XP do ustawienia')
        .setRequired(true)
        .setMinValue(0)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const author = isSlash ? interaction.user : interaction.author;

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      const message = '❌ Musisz być administratorem aby użyć tej komendy!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    let target, amount;
    if (isSlash) {
      target = interaction.options.getUser('użytkownik');
      amount = interaction.options.getInteger('xp');
    } else {
      target = interaction.mentions.users.first();
      amount = parseInt(args[1]);

      if (!target) {
        return interaction.reply('❌ Oznacz użytkownika!');
      }

      if (!amount || amount < 0 || isNaN(amount)) {
        return interaction.reply('❌ Podaj poprawną ilość XP!');
      }
    }

    const levels = getLevels();
    
    if (!levels[target.id]) {
      levels[target.id] = { xp: 0, level: 0, messages: 0 };
    }

    const oldXp = levels[target.id].xp;
    const oldLevel = getLevel(oldXp);
    
    levels[target.id].xp = amount;
    const newLevel = getLevel(amount);

    fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('⚙️ XP Ustawione!')
      .setDescription(`Ustawiono XP dla ${target}`)
      .addFields(
        { name: 'Stare XP', value: `${oldXp} (Poziom ${oldLevel})`, inline: true },
        { name: 'Nowe XP', value: `${amount} (Poziom ${newLevel})`, inline: true }
      )
      .setFooter({ text: `Zmienione przez ${author.tag}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
