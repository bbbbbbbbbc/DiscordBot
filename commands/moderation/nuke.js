const { PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Wyczyść cały kanał (sklonuj i usuń stary)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.reply({ content: '❌ Potrzebujesz uprawnień Administratora!', ephemeral: true });
      }

      const channel = interaction.channel;

      await interaction.reply({ content: '💣 Nukowanie kanału...', ephemeral: true });

      const position = channel.position;
      const newChannel = await channel.clone();
      await newChannel.setPosition(position);
      await channel.delete();

      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('💥 Kanał Znukowany!')
        .setDescription('Kanał został wyczyszczony!')
        .addFields(
          { name: 'Wykonane przez', value: interaction.user.tag, inline: true }
        )
        .setImage('https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif')
        .setTimestamp();

      await newChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie nuke:', error);
      try {
        await interaction.editReply({ content: '❌ Nie udało się znukować kanału!' });
      } catch (e) {
        console.error('Nie można edytować odpowiedzi:', e);
      }
    }
  },
};
