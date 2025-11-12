const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Pokaż avatar użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego avatar chcesz zobaczyć')
        .setRequired(false)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    let user, author;
    if (isSlash) {
      user = interaction.options.getUser('użytkownik') || interaction.user;
      author = interaction.user;
    } else {
      user = interaction.mentions.users.first() || interaction.author;
      author = interaction.author;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`Avatar: ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setFooter({ text: `Żądane przez ${author.tag}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
