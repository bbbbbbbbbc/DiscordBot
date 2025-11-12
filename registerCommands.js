const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';

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
      const data = await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: first100 },
      );
      
      console.log(`✅ Zarejestrowano ${data.length}/100 komend GLOBALNIE`);
      console.log(`⚠️ Brakuje ${commands.length - 100} komend (użyj GUILD_ID aby je dodać)`);
    } else {
      console.log(`\n📝 Rejestruję wszystkie ${commands.length} komend GUILD (serwer: ${GUILD_ID})...`);
      
      const data = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands },
      );

      console.log(`✅ Pomyślnie zarejestrowano ${data.length} komend slash na serwerze!`);
      console.log(`📊 Komendy działają natychmiast`);
    }
  } catch (error) {
    console.error('❌ Błąd rejestracji komend:', error);
  }
})();
