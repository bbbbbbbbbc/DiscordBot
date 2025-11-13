const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Brak wymaganych zmiennych: DISCORD_BOT_TOKEN, CLIENT_ID, GUILD_ID');
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
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
        }
      } catch (error) {
        console.error(`  ❌ Błąd: ${file}:`, error.message);
      }
    }
  }
}

console.log(`📊 Znaleziono ${commands.length} komend\n`);

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('🎯 ROZWIĄZANIE PROBLEMU BASE_TYPE_MAX_LENGTH\n');
    console.log('Problem: PUT wszystkich 156 komend naraz powoduje błąd');
    console.log('Rozwiązanie: Wyczyść wszystkie i POST każdą pojedynczo\n');
    console.log('='.repeat(70) + '\n');
    
    // KROK 1: Wyczyść WSZYSTKIE komendy używając PUT z pustym array
    console.log('🗑️  Czyszczenie wszystkich istniejących komend...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log('✅ Wszystkie stare komendy usunięte\n');
    
    // Krótkie opóźnienie po czyszczeniu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // KROK 2: POST każdą komendę pojedynczo (szybko, bez zbędnych opóźnień)
    console.log(`📤 Rejestruję ${commands.length} komend...\n`);
    
    let registered = 0;
    let failed = 0;
    const errors = [];
    const startTime = Date.now();
    
    // Rejestruj komendy z minimalnym opóźnieniem
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        await rest.post(
          Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
          { body: command }
        );
        registered++;
        
        // Progress bar co 5 komend
        if ((i + 1) % 5 === 0 || i === commands.length - 1) {
          const percent = Math.round((i + 1) / commands.length * 100);
          const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
          process.stdout.write(`\r[${bar}] ${percent}% (${i + 1}/${commands.length})`);
        }
        
      } catch (error) {
        failed++;
        errors.push({ name: command.name, error: error.message.substring(0, 80) });
      }
      
      // Małe opóźnienie co 50 komend aby uniknąć rate limits (5/s limit)
      if ((i + 1) % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n\n' + '='.repeat(70));
    console.log('🎊 REJESTRACJA ZAKOŃCZONA!');
    console.log('='.repeat(70));
    console.log(`✅ Zarejestrowano: ${registered}/${commands.length} komend`);
    console.log(`⏱️  Czas: ${duration}s`);
    
    if (failed > 0) {
      console.log(`\n❌ Błędy: ${failed} komend`);
      errors.forEach(e => console.log(`   - ${e.name}: ${e.error}`));
    }
    
    console.log('='.repeat(70));
    
    if (registered === commands.length) {
      console.log('\n🎉 PROBLEM ROZWIĄZANY!');
      console.log('✅ Wszystkie 156 komend zostały pomyślnie zarejestrowane');
      console.log('💡 Używamy POST dla pojedynczych komend zamiast PUT dla wszystkich');
      console.log('🚀 Komendy są dostępne natychmiast na serwerze!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Błąd:', error.message);
    process.exit(1);
  }
})();
