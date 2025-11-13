const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../data/economySettings.json');

function getSettings() {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, '{}');
  }
  return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function getGuildSettings(guildId) {
  const settings = getSettings();
  if (!settings[guildId]) {
    settings[guildId] = {
      work: { min: 150, max: 900 },
      daily: { min: 500, max: 1000 }
    };
    saveSettings(settings);
  }
  return settings[guildId];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ekonomia-ustawienia')
    .setDescription('Ustawienia ekonomii (tylko właściciel serwera)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('pokaz')
        .setDescription('Pokaż obecne ustawienia ekonomii'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('work')
        .setDescription('Ustaw zarobki z /work')
        .addIntegerOption(option =>
          option.setName('min')
            .setDescription('Minimalna kwota (domyślnie: 150)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10000))
        .addIntegerOption(option =>
          option.setName('max')
            .setDescription('Maksymalna kwota (domyślnie: 900)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10000)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('daily')
        .setDescription('Ustaw zarobki z /daily')
        .addIntegerOption(option =>
          option.setName('min')
            .setDescription('Minimalna kwota (domyślnie: 500)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10000))
        .addIntegerOption(option =>
          option.setName('max')
            .setDescription('Maksymalna kwota (domyślnie: 1000)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10000)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('Resetuj ustawienia do domyślnych')),

  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!isSlash) {
      return interaction.reply('❌ Ta komenda działa tylko jako slash command (/ekonomia-ustawienia)');
    }

    if (interaction.user.id !== interaction.guild.ownerId) {
      return await interaction.reply({
        content: '❌ Tylko właściciel serwera może zmieniać ustawienia ekonomii!',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const settings = getSettings();

    if (!settings[guildId]) {
      settings[guildId] = {
        work: { min: 150, max: 900 },
        daily: { min: 500, max: 1000 }
      };
    }

    if (subcommand === 'pokaz') {
      const guildSettings = settings[guildId];
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⚙️ Ustawienia Ekonomii')
        .setDescription(`Obecne ustawienia dla **${interaction.guild.name}**`)
        .addFields(
          {
            name: '💼 Work (/work)',
            value: `Min: **${guildSettings.work.min} 🪙**\nMax: **${guildSettings.work.max} 🪙**`,
            inline: true
          },
          {
            name: '🎁 Daily (/daily)',
            value: `Min: **${guildSettings.daily.min} 🪙**\nMax: **${guildSettings.daily.max} 🪙**`,
            inline: true
          }
        )
        .setFooter({ text: 'Używaj /ekonomia-ustawienia work/daily aby zmienić' })
        .setTimestamp();

      return await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'work') {
      const min = interaction.options.getInteger('min');
      const max = interaction.options.getInteger('max');

      if (min > max) {
        return await interaction.reply({
          content: '❌ Minimalna kwota nie może być większa niż maksymalna!',
          ephemeral: true
        });
      }

      settings[guildId].work = { min, max };
      saveSettings(settings);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Zaktualizowano ustawienia Work')
        .setDescription(`Zarobki z **/work** ustawione na:`)
        .addFields(
          { name: 'Minimum', value: `${min} 🪙`, inline: true },
          { name: 'Maksimum', value: `${max} 🪙`, inline: true }
        )
        .setTimestamp();

      return await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'daily') {
      const min = interaction.options.getInteger('min');
      const max = interaction.options.getInteger('max');

      if (min > max) {
        return await interaction.reply({
          content: '❌ Minimalna kwota nie może być większa niż maksymalna!',
          ephemeral: true
        });
      }

      settings[guildId].daily = { min, max };
      saveSettings(settings);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Zaktualizowano ustawienia Daily')
        .setDescription(`Zarobki z **/daily** ustawione na:`)
        .addFields(
          { name: 'Minimum', value: `${min} 🪙`, inline: true },
          { name: 'Maksimum', value: `${max} 🪙`, inline: true }
        )
        .setTimestamp();

      return await interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'reset') {
      settings[guildId] = {
        work: { min: 150, max: 900 },
        daily: { min: 500, max: 1000 }
      };
      saveSettings(settings);

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🔄 Zresetowano ustawienia')
        .setDescription('Wszystkie ustawienia ekonomii zostały przywrócone do domyślnych wartości')
        .addFields(
          {
            name: '💼 Work',
            value: 'Min: 150 🪙 | Max: 900 🪙',
            inline: false
          },
          {
            name: '🎁 Daily',
            value: 'Min: 500 🪙 | Max: 1000 🪙',
            inline: false
          }
        )
        .setTimestamp();

      return await interaction.reply({ embeds: [embed] });
    }
  },
};
