const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';

async function retryRequest(fn, retries = 3, commandName = 'Unknown') {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const delay = Math.pow(2, attempt - 1) * 1000;
      
      if (isLastAttempt) {
        throw error;
      }
      
      console.log(`   ⚠️ Próba ${attempt}/${retries} nie powiodła się dla "${commandName}"`);
      console.log(`   ⏳ Czekam ${delay/1000}s przed ponowną próbą...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

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
    console.log(`\n⚠️ UWAGA: Discord limit globalnych komend to 100, masz ${commands.length}`);

    const GUILD_ID = process.env.GUILD_ID || null;
    
    if (!GUILD_ID) {
      console.log('\n📋 WYBIERZ TRYB REJESTRACJI:');
      console.log('\n1️⃣ GLOBAL (pierwsze 100 komend) - widoczne na wszystkich serwerach');
      console.log('   ⚠️ Aktualizacja: do 1 godziny');
      console.log('   ⚠️ Tylko 100 komend z 155 (55 nie będzie działać!)');
      console.log('\n2️⃣ GUILD (wszystkie 155 komend) - widoczne tylko na jednym serwerze');
      console.log('   ✅ Aktualizacja: natychmiastowa');
      console.log('   ✅ Brak limitu komend');
      console.log('   💡 Wymaga GUILD_ID (ID twojego serwera Discord)');
      console.log('\n📝 Rekomendacja: GUILD (wszystkie komendy działają)');
      console.log('\n🔧 Aby użyć trybu GUILD:');
      console.log('   1. Skopiuj ID serwera (Prawy klik → Kopiuj ID serwera)');
      console.log('   2. Utwórz sekret GUILD_ID w Replit Secrets');
      console.log('   3. Uruchom ponownie: node registerCommands.js');
      console.log('\n⚡ Rejestruję GLOBAL (pierwsze 100 komend)...');
      
      const first100 = commands.slice(0, 100);
      
      try {
        const data = await retryRequest(
          async () => {
            return await rest.put(
              Routes.applicationCommands(CLIENT_ID),
              { body: first100 }
            );
          },
          3,
          'Global Commands (100)'
        );
        
        console.log(`✅ Zarejestrowano ${data.length}/100 komend GLOBALNIE`);
        console.log(`⚠️ Brakuje ${commands.length - 100} komend (użyj GUILD_ID aby je dodać)`);
      } catch (error) {
        console.error(`\n❌ BŁĄD: Nie udało się zarejestrować komend globalnych po 3 próbach`);
        console.error(`   Szczegóły: ${error.message}`);
        throw error;
      }
    } else {
      console.log(`\n🎯 ROZWIĄZANIE PROBLEMU BASE_TYPE_MAX_LENGTH`);
      console.log('='.repeat(70));
      console.log(`Znaleziono: ${commands.length} komend`);
      console.log(`Problem: PUT wszystkich ${commands.length} komend naraz = błąd`);
      console.log(`Rozwiązanie: HYBRYDOWE (PUT 78 + POST ${commands.length - 78})`);
      console.log('='.repeat(70) + '\n');
      
      const batch1 = commands.slice(0, 78);
      console.log(`📤 KROK 1/2: Rejestruję bazę ${batch1.length} komend (PUT)...`);
      
      try {
        await retryRequest(
          async () => {
            return await rest.put(
              Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
              { body: batch1 }
            );
          },
          3,
          `Batch 1 (${batch1.length} komend)`
        );
        console.log(`✅ Zarejestrowano bazę: ${batch1.length} komend\n`);
      } catch (error) {
        console.error(`\n❌ BŁĄD KRYTYCZNY: Nie udało się zarejestrować bazy komend po 3 próbach`);
        console.error(`   Szczegóły: ${error.message}`);
        throw error;
      }
      
      // Opóźnienie między krokami
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const batch2 = commands.slice(78);
      console.log(`📤 KROK 2/2: Dodaję pozostałe ${batch2.length} komend (POST)...`);
      
      let added = 0;
      let failed = 0;
      const successfulCommands = [];
      const failedCommands = [];
      
      for (let i = 0; i < batch2.length; i++) {
        const commandName = batch2[i].name;
        
        try {
          await retryRequest(
            async () => {
              return await rest.post(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: batch2[i] }
              );
            },
            3,
            commandName
          );
          
          added++;
          successfulCommands.push(commandName);
          
          if ((i + 1) % 10 === 0 || i === batch2.length - 1) {
            process.stdout.write(`\r   Progress: ${i + 1}/${batch2.length} (${added} sukces, ${failed} błąd)   `);
          }
          
          if (i < batch2.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
        } catch (error) {
          failed++;
          failedCommands.push({ name: commandName, error: error.message });
          console.log(`\n   ❌ ${commandName}: Wszystkie 3 próby nie powiodły się`);
          console.log(`      Błąd: ${error.message.substring(0, 80)}`);
        }
      }
      
      console.log(`\n`);
      
      const all = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
      
      console.log('='.repeat(70));
      console.log('📊 SZCZEGÓŁOWY RAPORT REJESTRACJI KOMEND');
      console.log('='.repeat(70));
      
      console.log(`\n📦 KROK 1 (PUT): ${batch1.length} komend - ✅ SUKCES`);
      
      console.log(`\n📦 KROK 2 (POST): ${batch2.length} komend`);
      console.log(`   ✅ Zarejestrowano pomyślnie: ${added}`);
      console.log(`   ❌ Nie udało się zarejestrować: ${failed}`);
      
      if (failedCommands.length > 0) {
        console.log(`\n❌ KOMENDY, KTÓRE NIE ZOSTAŁY ZAREJESTROWANE (${failedCommands.length}):`);
        failedCommands.forEach((cmd, idx) => {
          console.log(`   ${idx + 1}. ${cmd.name}`);
          console.log(`      Błąd: ${cmd.error.substring(0, 100)}`);
        });
      }
      
      if (successfulCommands.length > 0 && successfulCommands.length <= 10) {
        console.log(`\n✅ POMYŚLNIE ZAREJESTROWANE KOMENDY (${successfulCommands.length}):`);
        successfulCommands.forEach((name, idx) => {
          console.log(`   ${idx + 1}. ${name}`);
        });
      } else if (successfulCommands.length > 10) {
        console.log(`\n✅ POMYŚLNIE ZAREJESTROWANE KOMENDY: ${successfulCommands.length}`);
        console.log(`   (Lista zbyt długa do wyświetlenia)`);
      }
      
      console.log(`\n${'='.repeat(70)}`);
      console.log('🎊 WYNIK KOŃCOWY');
      console.log('='.repeat(70));
      console.log(`Całkowita liczba komend w Discord: ${all.length}`);
      console.log(`Oczekiwano: ${commands.length}`);
      console.log(`Batch 1 (PUT): ${batch1.length} komend`);
      console.log(`Batch 2 (POST): ${added}/${batch2.length} komend`);
      console.log(`Całkowity sukces: ${batch1.length + added}/${commands.length}`);
      
      if (all.length === commands.length) {
        console.log(`\n🎉 SUKCES! Wszystkie ${commands.length} komend zostały zarejestrowane!`);
        console.log('✅ Problem BASE_TYPE_MAX_LENGTH rozwiązany');
        console.log('✅ Retry logic obsłużył wszystkie timeouty');
        console.log(`💡 Metoda: PUT (${batch1.length}) + POST (${batch2.length}) z retry logic\n`);
      } else if (all.length > 0) {
        console.log(`\n⚠️ Zarejestrowano ${all.length}/${commands.length}`);
        console.log(`Brakuje: ${commands.length - all.length} komend\n`);
        if (failedCommands.length > 0) {
          console.log(`💡 Sprawdź błędy powyżej dla nieudanych komend`);
        }
      }
      
      console.log('='.repeat(70));
    }
  } catch (error) {
    console.error('❌ Błąd rejestracji komend:', error);
    if (error.rawError && error.rawError.errors) {
      console.error('📋 Szczegóły błędu:', JSON.stringify(error.rawError.errors, null, 2));
    }
  }
})();
