const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Przetłumacz tekst (symulacja)')
    .addStringOption(option =>
      option.setName('tekst')
        .setDescription('Tekst do przetłumaczenia')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('język')
        .setDescription('Język docelowy')
        .setRequired(true)
        .addChoices(
          { name: 'Angielski', value: 'en' },
          { name: 'Niemiecki', value: 'de' },
          { name: 'Francuski', value: 'fr' },
          { name: 'Hiszpański', value: 'es' },
          { name: 'Włoski', value: 'it' }
        )
    ),
  
  async execute(interaction) {
    try {
      const text = interaction.options.getString('tekst');
      const lang = interaction.options.getString('język');

      const langNames = {
        'en': 'Angielski',
        'de': 'Niemiecki',
        'fr': 'Francuski',
        'es': 'Hiszpański',
        'it': 'Włoski'
      };

      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('🌐 Tłumaczenie')
        .addFields(
          { name: '📝 Oryginalny tekst', value: text },
          { name: '🎯 Język docelowy', value: langNames[lang] },
          { name: 'ℹ️ Informacja', value: 'To jest wersja demonstracyjna. Aby uzyskać prawdziwe tłumaczenia, zintegruj API tłumaczeniowe!' }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie translate:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas tłumaczenia!', ephemeral: true });
    }
  },
};
