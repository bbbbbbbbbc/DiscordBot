const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Szybkie głosowanie tak/nie')
    .addStringOption(option =>
      option.setName('pytanie')
        .setDescription('Pytanie do głosowania')
        .setRequired(true)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    let question;
    if (isSlash) {
      question = interaction.options.getString('pytanie');
    } else {
      if (args.length === 0) {
        return interaction.reply('❌ Podaj pytanie do głosowania!\nPrzykład: !vote Czy lubicie pizzę?');
      }
      question = args.join(' ');
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🗳️ Głosowanie')
      .setDescription(`**${question}**\n\n✅ - Tak\n❌ - Nie`)
      .setFooter({ text: `Głosowanie od ${author.tag}` })
      .setTimestamp();

    let voteMessage;
    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
      voteMessage = await interaction.fetchReply();
    } else {
      voteMessage = await channel.send({ embeds: [embed] });
      interaction.delete().catch(() => {});
    }

    await voteMessage.react('✅');
    await voteMessage.react('❌');
  },
};
