const OpenAI = require('openai');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Rozmawiaj z AI')
    .addStringOption(option =>
      option.setName('pytanie')
        .setDescription('Pytanie do AI')
        .setRequired(true)
    ),
  async execute(interaction, args) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    
    if (!process.env.OPENAI_API_KEY) {
      const message = '❌ Klucz OpenAI API nie jest skonfigurowany! Skontaktuj się z właścicielem bota.';
      if (isSlash) {
        return await interaction.reply(message);
      } else {
        return interaction.reply(message);
      }
    }

    let question;
    if (isSlash) {
      question = interaction.options.getString('pytanie');
    } else {
      question = args.join(' ');
      if (!question) {
        return interaction.reply('❌ Podaj pytanie! Użyj: `!chat [pytanie]`');
      }
    }

    let thinkingMsg;
    if (isSlash) {
      await interaction.reply('🤔 Myślę...');
      thinkingMsg = await interaction.fetchReply();
    } else {
      thinkingMsg = await interaction.reply('🤔 Myślę...');
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Jesteś pomocnym asystentem Discord bota. Odpowiadaj po polsku, zwięźle i pomocnie.' },
          { role: 'user', content: question }
        ],
        max_tokens: 500,
      });

      const answer = completion.choices[0].message.content;
      
      const response = answer.length > 2000 
        ? `🤖 **AI odpowiada:**\n\n${answer.substring(0, 1997)}...`
        : `🤖 **AI odpowiada:**\n\n${answer}`;
      
      if (isSlash) {
        await interaction.editReply(response);
      } else {
        await thinkingMsg.edit(response);
      }
    } catch (error) {
      console.error('OpenAI Error:', error);
      const errorMsg = '❌ Wystąpił błąd podczas komunikacji z AI!';
      if (isSlash) {
        await interaction.editReply(errorMsg);
      } else {
        await thinkingMsg.edit(errorMsg);
      }
    }
  },
};
