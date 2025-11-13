const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];

// Load only download command
const downloadCmd = require('./commands/youtube/download.js');
commands.push(downloadCmd.data.toJSON());

console.log(`📤 Rejestruję komendę /download z nowymi opcjami...`);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    if (guildId) {
      console.log(`✅ Rejestracja GUILD (serwer: ${guildId}) - natychmiastowa aktualizacja`);
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ Komenda /download zaktualizowana na serwerze!`);
    } else {
      console.log(`✅ Rejestracja GLOBALNA`);
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ Komenda /download zaktualizowana globalnie (może potrwać do 1h)`);
    }
  } catch (error) {
    console.error('❌ Błąd:', error);
  }
})();
