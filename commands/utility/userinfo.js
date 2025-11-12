const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Informacje o użytkowniku')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik którego informacje chcesz zobaczyć')
        .setRequired(false)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    let user, author, guild;
    if (isSlash) {
      user = interaction.options.getUser('użytkownik') || interaction.user;
      author = interaction.user;
      guild = interaction.guild;
    } else {
      user = interaction.mentions.users.first() || interaction.author;
      author = interaction.author;
      guild = interaction.guild;
    }
    
    const member = guild.members.cache.get(user.id);
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Konto utworzone', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 Dołączył', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
        { name: '🎭 Role', value: member ? member.roles.cache.filter(r => r.id !== guild.id).map(r => r).join(', ') || 'Brak' : 'N/A' }
      )
      .setFooter({ text: `Żądane przez ${author.tag}` })
      .setTimestamp();

    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ embeds: [embed] });
    }
  },
};
