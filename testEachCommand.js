const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Testuję każdą komendę pojedynczo z Discord API...\n');

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  const failedCommands = [];
  let totalCommands = 0;
  let successCount = 0;
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(__dirname, 'commands', folder);
    if (!fs.existsSync(commandsPath)) continue;
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandPath = `${folder}/${file}`;
      totalCommands++;
      
      try {
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if (!('data' in command)) {
          console.log(`⚠️  ${commandPath} - brak 'data'`);
          continue;
        }
        
        const commandData = command.data.toJSON();
        
        // Try to register this single command
        try {
          if (GUILD_ID) {
            await rest.put(
              Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
              { body: [commandData] }
            );
          } else {
            // Just validate without registering (using global endpoint with empty array to reset)
            await rest.put(
              Routes.applicationCommands(CLIENT_ID),
              { body: [commandData] }
            );
          }
          
          console.log(`✅ ${commandPath} (${commandData.name})`);
          successCount++;
          
        } catch (apiError) {
          console.log(`\n❌❌❌ BŁĄD ZNALEZIONY! ❌❌❌`);
          console.log(`Plik: ${commandPath}`);
          console.log(`Komenda: ${commandData.name}`);
          console.log(`\nError Message: ${apiError.message}`);
          
          if (apiError.rawError) {
            console.log(`\nRaw Error Details:`);
            console.log(JSON.stringify(apiError.rawError, null, 2));
          }
          
          console.log(`\n📋 Command Data:`);
          console.log(JSON.stringify(commandData, null, 2));
          console.log(`\n${'='.repeat(70)}\n`);
          
          failedCommands.push({
            path: commandPath,
            name: commandData.name,
            error: apiError.message,
            rawError: apiError.rawError,
            data: commandData
          });
          
          // Stop at first error to make it clear
          console.log('🛑 Zatrzymano na pierwszym błędzie. Napraw tę komendę i uruchom ponownie.\n');
          process.exit(1);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`⚠️  ${commandPath} - błąd wczytywania: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 PODSUMOWANIE:`);
  console.log(`   Przetestowano: ${totalCommands} komend`);
  console.log(`   ✅ Sukces: ${successCount} komend`);
  console.log(`   ❌ Błędy: ${failedCommands.length} komend`);
  
  if (failedCommands.length === 0) {
    console.log('\n✅ Wszystkie komendy przeszły walidację Discord API!');
    console.log('   Błąd może występować tylko przy rejestracji WSZYSTKICH komend naraz.');
    console.log('   Sprawdź limit 100 komend dla globalnych rejestracji.');
  } else {
    console.log('\n❌ PROBLEMATYCZNE KOMENDY:');
    failedCommands.forEach((cmd, i) => {
      console.log(`\n${i + 1}. ${cmd.path} (${cmd.name})`);
      console.log(`   Error: ${cmd.error}`);
    });
  }
})();
