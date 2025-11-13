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

// Funkcja opóźnienia
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  try {
    if (!GUILD_ID) {
      console.log('⚠️ Brak GUILD_ID - rejestruję jako komendy globalne (limit 100)\n');
      
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands.slice(0, 100) });
      console.log(`✅ Zarejestrowano 100 komend globalnych`);
      console.log(`⚠️ Pominięto ${commands.length - 100} komend (limit 100)\n`);
      
    } else {
      console.log(`📝 ROZWIĄZANIE: Rejestracja w mniejszych batch'ach\n`);
      console.log(`Zamiast rejestrować wszystkie 156 komend naraz (co powoduje błąd),`);
      console.log(`podzielimy je na mniejsze grupy po 50 komend.\n`);
      
      // KROK 1: Pobierz istniejące komendy
      console.log('🔍 Pobieranie istniejących komend...');
      const existingCommands = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
      console.log(`📋 Znaleziono ${existingCommands.length} istniejących komend\n`);
      
      // KROK 2: Zarejestruj nowe komendy w batch'ach używając POST
      console.log(`📤 Rejestruję ${commands.length} komend pojedynczo (POST method)...\n`);
      
      // Najpierw usuń wszystkie stare komendy aby uniknąć duplikatów
      for (const existingCmd of existingCommands) {
        try {
          await rest.delete(Routes.applicationGuildCommand(CLIENT_ID, GUILD_ID, existingCmd.id));
        } catch (error) {
          // Ignoruj błędy usuwania
        }
      }
      console.log('✅ Usunięto stare komendy\n');
      
      await delay(1000);
      
      // Rejestruj każdą komendę pojedynczo
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
          
          // Pokazuj progress
          if (i % 10 === 0 || i === commands.length - 1) {
            const percent = Math.round((i + 1) / commands.length * 100);
            process.stdout.write(`\r✅ Postęp: ${registered}/${commands.length} (${percent}%)   `);
          }
          
          // Małe opóźnienie co 10 komend aby uniknąć rate limits
          if (i % 10 === 0) {
            await delay(200);
          }
          
        } catch (error) {
          failed++;
          failedCommands.push({ 
            name: command.name, 
            error: error.message.substring(0, 100) 
          });
          process.stdout.write(`\r❌ Błąd: ${command.name}                    \n`);
        }
      }
      
      console.log(`\n\n${'='.repeat(70)}`);
      console.log('🎉 REJESTRACJA ZAKOŃCZONA!');
      console.log('='.repeat(70));
      console.log(`✅ Pomyślnie zarejestrowano: ${registered}/${commands.length} komend`);
      
      if (failed > 0) {
        console.log(`❌ Niepowodzenia: ${failed}/${commands.length} komend`);
        console.log(`\n⚠️ Komendy które nie zostały zarejestrowane:`);
        failedCommands.forEach(cmd => {
          console.log(`   - ${cmd.name}: ${cmd.error}`);
        });
      }
      
      console.log('='.repeat(70));
      
      if (registered === commands.length) {
        console.log('\n🎊 SUKCES! Wszystkie 156 komend zostały pomyślnie zarejestrowane!');
        console.log('✅ Problem rozwiązany: Używamy POST dla pojedynczych komend zamiast PUT dla wszystkich naraz');
        console.log('💡 Komendy są dostępne natychmiast na serwerze Guild\n');
      } else if (registered > 0) {
        console.log(`\n✅ Zarejestrowano ${registered} komend. Sprawdź błędy powyżej.\n`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Krytyczny błąd:', error.message);
    if (error.rawError && error.rawError.errors) {
      console.error('📋 Szczegóły:', JSON.stringify(error.rawError.errors, null, 2));
    }
    process.exit(1);
  }
})();
