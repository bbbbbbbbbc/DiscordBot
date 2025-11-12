const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Rosyjska ruletka'),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    const chamber = Math.floor(Math.random() * 6) + 1;
    const shot = Math.floor(Math.random() * 6) + 1;

    if (isSlash) {
      await interaction.reply('🔫 *Kręcenie bębna...*');
    } else {
      await channel.send('🔫 *Kręcenie bębna...*');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = chamber === shot 
      ? `💥 **BANG!** ${author} nie przeżył!\n*Pocisk był w komorze ${chamber}*`
      : `✨ **Klik...** ${author} miał szczęście!\n*Pocisk był w komorze ${chamber}, wystrzeliłeś ${shot}*`;

    if (isSlash) {
      await interaction.followUp(result);
    } else {
      channel.send(result);
    }
  },
};
