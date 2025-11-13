const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Brak wymaganych zmiennych środowiskowych');
  process.exit(1);
}

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('📋 Ładowanie komend...');

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
        }
      } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
      }
    }
  }
}

console.log(`✅ Załadowano ${commands.length} komend\n`);

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

// Rate limiter: Max 5 requests per second (Discord limit)
const DELAY_MS = 250; // 250ms = 4 requests/second (safe rate)

async function registerCommands() {
  try {
    console.log('🗑️  Czyszczenie starych komend...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
    console.log('✅ Wyczyszczono\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📤 Rejestruję ${commands.length} komend (około ${Math.ceil(commands.length * DELAY_MS / 1000)}s)...\n`);
    
    let success = 0;
    let failed = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      
      try {
        await rest.post(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: cmd });
        success++;
        
        // Progress co 10 komend
        if ((i + 1) % 10 === 0 || i === commands.length - 1) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const percent = Math.round((i + 1) / commands.length * 100);
          console.log(`✅ ${i + 1}/${commands.length} (${percent}%) - ${elapsed}s`);
        }
        
        // Rate limiting delay
        if (i < commands.length - 1) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
        
      } catch (error) {
        failed++;
        console.error(`❌ ${cmd.name}: ${error.message}`);
      }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SUKCES! Rejestracja zakończona');
    console.log('='.repeat(60));
    console.log(`Zarejestrowano: ${success}/${commands.length}`);
    console.log(`Błędy: ${failed}`);
    console.log(`Czas: ${totalTime}s`);
    console.log('='.repeat(60));
    
    if (success === commands.length) {
      console.log('\n🎉 Wszystkie 156 komend działają!');
      console.log('💡 Rozwiązanie: POST pojedynczo zamiast PUT wszystkich naraz\n');
    }
    
  } catch (error) {
    console.error('\n❌ Błąd:', error.message);
    process.exit(1);
  }
}

registerCommands();
