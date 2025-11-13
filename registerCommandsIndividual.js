const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID) {
  console.error('❌ Brak DISCORD_BOT_TOKEN lub CLIENT_ID w zmiennych środowiskowych!');
  process.exit(1);
}

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('📋 Zbieranie komend slash...\n');

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
          console.log(`  ✅ ${command.data.name}`);
        }
      } catch (error) {
        console.error(`  ❌ Błąd ładowania ${file}:`, error.message);
      }
    }
  }
}

console.log(`\n📊 Znaleziono ${commands.length} komend slash\n`);

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

// Funkcja opóźnienia dla rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    if (!GUILD_ID) {
      console.log('⚠️ Brak GUILD_ID - rejestruję jako komendy globalne (limit 100)\n');
      console.log('💡 Aby zarejestrować wszystkie komendy, dodaj GUILD_ID do sekretów\n');
      
      // Wyczyść istniejące komendy globalne
      console.log('🗑️ Czyszczenie starych komend globalnych...');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
      
      // Zarejestruj pierwsze 100 komend globalnie
      const first100 = commands.slice(0, 100);
      let registered = 0;
      
      for (const command of first100) {
        try {
          await rest.post(Routes.applicationCommands(CLIENT_ID), { body: command });
          registered++;
          process.stdout.write(`\r✅ Zarejestrowano ${registered}/${first100.length} komend globalnych...`);
          await delay(100); // Opóźnienie 100ms między requestami
        } catch (error) {
          console.error(`\n❌ Błąd rejestracji komendy ${command.name}:`, error.message);
        }
      }
      
      console.log(`\n\n✅ Zarejestrowano ${registered} komend globalnych`);
      console.log(`⚠️ Pominięto ${commands.length - 100} komend (przekroczono limit 100)`);
      
    } else {
      console.log(`📝 Rejestruję wszystkie ${commands.length} komend na serwerze Guild (ID: ${GUILD_ID})\n`);
      
      // KROK 1: Wyczyść wszystkie istniejące komendy guild
      console.log('🗑️ Czyszczenie starych komend...');
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
      console.log('✅ Stare komendy usunięte\n');
      
      await delay(500); // Krótkie opóźnienie po czyszczeniu
      
      // KROK 2: Rejestruj każdą komendę pojedynczo
      console.log('📤 Rejestruję komendy pojedynczo...\n');
      
      let registered = 0;
      let failed = 0;
      const failedCommands = [];
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        try {
          await rest.post(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: command }
          );
          registered++;
          
          // Pokazuj progress co 10 komend
          if (registered % 10 === 0 || registered === commands.length) {
            process.stdout.write(`\r✅ Postęp: ${registered}/${commands.length} komend zarejestrowanych...`);
          }
          
          // Opóźnienie między requestami (50ms - bezpieczne dla rate limits)
          await delay(50);
          
        } catch (error) {
          failed++;
          failedCommands.push({ name: command.name, error: error.message });
          console.error(`\n❌ Błąd rejestracji komendy "${command.name}":`, error.message);
        }
      }
      
      console.log(`\n\n${'='.repeat(60)}`);
      console.log('📊 PODSUMOWANIE REJESTRACJI');
      console.log('='.repeat(60));
      console.log(`✅ Pomyślnie zarejestrowano: ${registered}/${commands.length} komend`);
      console.log(`❌ Błędy: ${failed}/${commands.length} komend`);
      
      if (failedCommands.length > 0) {
        console.log(`\n⚠️ Komendy które nie zostały zarejestrowane:`);
        failedCommands.forEach(cmd => {
          console.log(`   - ${cmd.name}: ${cmd.error}`);
        });
      }
      
      console.log('='.repeat(60));
      
      if (registered === commands.length) {
        console.log('\n🎉 SUKCES! Wszystkie komendy zostały pomyślnie zarejestrowane!');
        console.log('💡 Komendy są dostępne natychmiast na serwerze Guild');
      } else {
        console.log('\n⚠️ Niektóre komendy nie zostały zarejestrowane. Sprawdź błędy powyżej.');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Krytyczny błąd podczas rejestracji:', error);
    if (error.rawError && error.rawError.errors) {
      console.error('📋 Szczegóły błędu:', JSON.stringify(error.rawError.errors, null, 2));
    }
    process.exit(1);
  }
})();
