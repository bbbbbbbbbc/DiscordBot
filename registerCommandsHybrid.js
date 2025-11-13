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
        console.error(`  ❌ Błąd ładowania ${file}:`, error.message);
      }
    }
  }
}

console.log(`📊 Znaleziono ${commands.length} komend\n`);

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('🎯 ROZWIĄZANIE HYBRYDOWE\n');
    console.log('PROBLEM: PUT wszystkich 156 komend naraz = błąd BASE_TYPE_MAX_LENGTH');
    console.log('ROZWIĄZANIE: PUT pierwszych 100 + POST pozostałych 56\n');
    console.log('='.repeat(70) + '\n');
    
    // KROK 1: PUT pierwszych 100 komend (DZIAŁA - sprawdzone przez użytkownika)
    const batch1 = commands.slice(0, 100);
    console.log(`📤 KROK 1: Rejestruję pierwsze ${batch1.length} komend (PUT)...`);
    
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: batch1 }
    );
    
    console.log(`✅ Zarejestrowano ${data.length} komend przez PUT\n`);
    
    // Krótkie opóźnienie przed STEP 2
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // KROK 2: POST pozostałych komend (dodaj bez usuwania poprzednich)
    const batch2 = commands.slice(100);
    console.log(`📤 KROK 2: Dodaję pozostałe ${batch2.length} komend (POST)...`);
    
    let added = 0;
    for (let i = 0; i < batch2.length; i++) {
      const cmd = batch2[i];
      
      try {
        await rest.post(
          Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
          { body: cmd }
        );
        added++;
        
        // Progress co 5 komend
        if ((i + 1) % 5 === 0 || i === batch2.length - 1) {
          process.stdout.write(`\r   ✅ Postęp: ${i + 1}/${batch2.length} (${added} dodanych)   `);
        }
        
        // Rate limiting: 200ms delay między requestami
        if (i < batch2.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (error) {
        console.error(`\n   ❌ Błąd: ${cmd.name} - ${error.message}`);
      }
    }
    
    console.log(`\n\n✅ Dodano ${added}/${batch2.length} komend przez POST\n`);
    
    // WERYFIKACJA: Sprawdź ile komend jest zarejestrowanych
    console.log('🔍 Weryfikuję...');
    const allCommands = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
    
    console.log('\n' + '='.repeat(70));
    console.log('🎊 WYNIK KOŃCOWY');
    console.log('='.repeat(70));
    console.log(`Całkowita liczba zarejestrowanych komend: ${allCommands.length}`);
    console.log(`Oczekiwano: ${commands.length}`);
    
    if (allCommands.length === commands.length) {
      console.log('\n🎉 SUKCES! Wszystkie 156 komend zostały pomyślnie zarejestrowane!');
      console.log('✅ Rozwiązanie: PUT (100) + POST (56) = 156 komend');
      console.log('💡 Problem BASE_TYPE_MAX_LENGTH został rozwiązany!\n');
    } else {
      console.log(`\n⚠️  Niezgodność: ${allCommands.length} vs ${commands.length}`);
      console.log('Sprawdź błędy powyżej.\n');
    }
    
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Błąd:', error.message);
    if (error.rawError) {
      console.error('Szczegóły:', JSON.stringify(error.rawError, null, 2));
    }
    process.exit(1);
  }
})();
