const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const joinCmd = require('./commands/music/join.js');
const commands = [joinCmd.data.toJSON()];

console.log('📤 Rejestruję komendę /join...');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log('✅ Komenda /join zarejestrowana na serwerze!');
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log('✅ Komenda /join zarejestrowana globalnie!');
    }
  } catch (error) {
    console.error('❌ Błąd:', error);
  }
})();
