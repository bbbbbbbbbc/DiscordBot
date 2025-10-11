const OpenAI = require('openai');

module.exports = {
  name: 'chat',
  description: 'Rozmawiaj z AI',
  aliases: ['ai', 'ask'],
  async execute(message, args) {
    if (!process.env.OPENAI_API_KEY) {
      return message.reply('❌ Klucz OpenAI API nie jest skonfigurowany! Skontaktuj się z właścicielem bota.');
    }

    const question = args.join(' ');
    if (!question) {
      return message.reply('❌ Podaj pytanie! Użyj: `!chat [pytanie]`');
    }

    const thinkingMsg = await message.reply('🤔 Myślę...');

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
      
      if (answer.length > 2000) {
        await thinkingMsg.edit(`🤖 **AI odpowiada:**\n\n${answer.substring(0, 1997)}...`);
      } else {
        await thinkingMsg.edit(`🤖 **AI odpowiada:**\n\n${answer}`);
      }
    } catch (error) {
      console.error('OpenAI Error:', error);
      await thinkingMsg.edit('❌ Wystąpił błąd podczas komunikacji z AI!');
    }
  },
};
