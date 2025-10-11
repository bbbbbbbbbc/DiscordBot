module.exports = {
  name: 'ping',
  description: 'Sprawdź opóźnienie bota',
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Pong!');
    const timeDiff = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`🏓 Pong!\n📊 Opóźnienie: ${timeDiff}ms\n💓 API Latency: ${Math.round(client.ws.ping)}ms`);
  },
};
