const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      try {
        const command = require(path.join(commandsPath, file));
        if ('data' in command) commands.push(command.data.toJSON());
      } catch (e) {}
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

// Dodaj tylko komendy 78-156
const remaining = commands.slice(78);
console.log(`Dodaję ${remaining.length} komend (od 78 do ${commands.length})...`);

(async () => {
  for (let i = 0; i < remaining.length; i++) {
    try {
      await rest.post(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: remaining[i] });
      console.log(`${i + 1}/${remaining.length}: ${remaining[i].name} ✅`);
    } catch (e) {
      console.log(`${i + 1}/${remaining.length}: ${remaining[i].name} ❌ ${e.message.substring(0, 50)}`);
    }
    // Delay 300ms between requests
    if (i < remaining.length - 1) await new Promise(r => setTimeout(r, 300));
  }
  
  const all = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID));
  console.log(`\n✅ Łącznie zarejestrowano: ${all.length} komend`);
})();
