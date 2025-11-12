const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Stwórz ankietę')
    .addStringOption(option =>
      option.setName('pytanie')
        .setDescription('Pytanie ankiety')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('opcje')
        .setDescription('Opcje oddzielone znakiem | (np. Opcja1 | Opcja2 | Opcja3)')
        .setRequired(true)
    ),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    const channel = isSlash ? interaction.channel : interaction.channel;
    
    let question, options;
    
    if (isSlash) {
      question = interaction.options.getString('pytanie');
      const optionsString = interaction.options.getString('opcje');
      options = optionsString.split('|').map(s => s.trim());
      
      if (options.length < 2) {
        return await interaction.reply('❌ Ankieta musi mieć przynajmniej 2 opcje! Oddziel je znakiem |');
      }
    } else {
      if (args.length < 3) {
        return interaction.reply('❌ Użyj: !poll <pytanie> | <opcja1> | <opcja2> | ...\nPrzykład: !poll Ulubiony kolor? | Czerwony | Niebieski | Zielony');
      }
      
      const pollData = args.join(' ').split('|').map(s => s.trim());
      
      if (pollData.length < 3) {
        return interaction.reply('❌ Ankieta musi mieć pytanie i przynajmniej 2 opcje!');
      }
      
      question = pollData[0];
      options = pollData.slice(1);
    }

    if (options.length > 10) {
      const message = '❌ Maksymalnie 10 opcji!';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('📊 Ankieta')
      .setDescription(`**${question}**\n\n${options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n')}`)
      .setFooter({ text: `Ankieta od ${author.tag}` })
      .setTimestamp();

    let pollMessage;
    if (isSlash) {
      await interaction.reply({ embeds: [embed] });
      pollMessage = await interaction.fetchReply();
    } else {
      pollMessage = await channel.send({ embeds: [embed] });
      interaction.delete().catch(() => {});
    }

    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(emojis[i]);
    }
  },
};
