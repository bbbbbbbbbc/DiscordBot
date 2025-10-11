module.exports = {
  name: 'roulette',
  description: 'Rosyjska ruletka',
  aliases: ['rr'],
  async execute(message, args) {
    const chamber = Math.floor(Math.random() * 6) + 1;
    const shot = Math.floor(Math.random() * 6) + 1;

    await message.channel.send('🔫 *Kręcenie bębna...*');
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (chamber === shot) {
      message.channel.send(`💥 **BANG!** ${message.author} nie przeżył!\n*Pocisk był w komorze ${chamber}*`);
    } else {
      message.channel.send(`✨ **Klik...** ${message.author} miał szczęście!\n*Pocisk był w komorze ${chamber}, wystrzeliłeś ${shot}*`);
    }
  },
};
