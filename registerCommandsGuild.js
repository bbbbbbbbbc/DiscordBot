const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// TUTAJ PODAJ ID SWOJEGO SERWERA
const GUILD_ID = process.argv[2];

if (!GUILD_ID) {
  console.log('❌ Musisz podać Guild ID!');
  console.log('Użycie: node registerCommandsGuild.js [GUILD_ID]');
  console.log('\nAby znaleźć Guild ID:');
  console.log('1. Włącz tryb deweloperski w Discord (Ustawienia > Zaawansowane > Tryb dewelopera)');
  console.log('2. Kliknij prawym na ikonę serwera > Kopiuj identyfikator serwera');
  process.exit(1);
}

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats'];

console.log('📋 Zbieranie komend slash...');

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)];
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
    console.log(`\n🔄 Rejestracja ${commands.length} komend dla serwera ${GUILD_ID}...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log(`✅ Pomyślnie zarejestrowano ${data.length} komend dla tego serwera!`);
    console.log('⚡ Komendy są dostępne NATYCHMIAST (bez czekania)!');
  } catch (error) {
    console.error('❌ Błąd rejestracji:', error);
  }
})();
