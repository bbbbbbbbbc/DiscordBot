const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats'];

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
    console.log(`\n🔄 Rozpoczynam rejestrację ${commands.length} komend slash...`);

    const data = await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

    console.log(`✅ Pomyślnie zarejestrowano ${data.length} komend slash globalnie!`);
  } catch (error) {
    console.error('❌ Błąd rejestracji komend:', error);
  }
})();
