const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Ładowanie komend...\n');

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      
      if ('data' in command && 'execute' in command) {
        const commandData = command.data.toJSON();
        
        const guildOnlyCommands = ['ban', 'kick', 'mute', 'unmute', 'warn', 'warnings', 'slowmode', 'tempban', 'lockdown', 'unlock', 'purge', 'nuke', 'clear', 'automod', 'filter', 'announcement'];
        
        if (guildOnlyCommands.includes(commandData.name)) {
          commandData.integration_types = [0];
          commandData.contexts = [0];
        } else {
          commandData.integration_types = [0, 1];
          commandData.contexts = [0, 1, 2];
        }
        
        commands.push({
          data: commandData,
          file: `${folder}/${file}`
        });
      }
    }
  }
}

console.log(`📊 Załadowano ${commands.length} komend\n`);

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  console.log('🧪 Testowanie każdej komendy indywidualnie...\n');
  
  let successCount = 0;
  let failedCommands = [];
  
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    
    try {
      await rest.post(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: cmd.data }
      );
      
      successCount++;
      process.stdout.write(`✅ ${i + 1}/${commands.length}: ${cmd.data.name} (${cmd.file})\r`);
    } catch (error) {
      console.log(`\n\n❌ BŁĄD w komendzie ${i + 1}/${commands.length}:`);
      console.log(`📁 Plik: ${cmd.file}`);
      console.log(`📝 Nazwa: ${cmd.data.name}`);
      console.log(`📏 Rozmiar JSON: ${JSON.stringify(cmd.data).length} znaków`);
      console.log(`\n🔴 Błąd Discord API:`);
      
      if (error.rawError && error.rawError.errors) {
        console.log(JSON.stringify(error.rawError.errors, null, 2));
      } else {
        console.log(error.message);
      }
      
      console.log(`\n📋 Pełny JSON komendy:`);
      console.log(JSON.stringify(cmd.data, null, 2));
      
      failedCommands.push({
        file: cmd.file,
        name: cmd.data.name,
        error: error.message
      });
      
      console.log(`\n⏭️ Kontynuowanie z następną komendą...\n`);
    }
  }
  
  console.log(`\n\n✅ Zakończono test`);
  console.log(`📊 Sukces: ${successCount}/${commands.length}`);
  
  if (failedCommands.length > 0) {
    console.log(`\n❌ Komendy z błędami (${failedCommands.length}):`);
    failedCommands.forEach(cmd => {
      console.log(`   - ${cmd.file} (${cmd.name}): ${cmd.error}`);
    });
  }
})();
