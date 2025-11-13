const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('📋 Zbieranie komend slash...');

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`  ✅ ${command.data.name}`);
      }
    }
  }
}

console.log(`\n📊 Znaleziono ${commands.length} komend slash`);

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  try {
    const start = parseInt(process.argv[2]) || 0;
    const end = parseInt(process.argv[3]) || commands.length;
    const testCommands = commands.slice(start, end);
    
    console.log(`\n📝 BINARY SEARCH: Rejestruję komendy ${start}-${end} (${testCommands.length} komend)...\n`);
    
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: testCommands },
    );

    console.log(`✅ Pomyślnie zarejestrowano ${data.length} komend slash na serwerze!`);
  } catch (error) {
    console.error('❌ Błąd rejestracji komend:', error.message);
    if (error.rawError && error.rawError.errors) {
      console.error('📋 Szczegóły błędu:', JSON.stringify(error.rawError.errors, null, 2));
    }
  }
})();
