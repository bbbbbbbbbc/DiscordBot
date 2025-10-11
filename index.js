const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.games = new Map();

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube'];

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
      }
    }
  }
}

client.once('ready', () => {
  console.log(`✅ Bot zalogowany jako ${client.user.tag}`);
  console.log(`🎮 Załadowano ${client.commands.size} komend`);
  client.user.setActivity('!help - Zobacz komendy', { type: 'PLAYING' });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || 
                  client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`Błąd wykonywania komendy ${commandName}:`, error);
    message.reply('❌ Wystąpił błąd podczas wykonywania tej komendy!');
  }
});

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ Błąd: Nie znaleziono DISCORD_BOT_TOKEN w zmiennych środowiskowych!');
  console.log('📝 Ustaw token Discord bota w zakładce Secrets jako DISCORD_BOT_TOKEN');
  process.exit(1);
}

client.login(DISCORD_BOT_TOKEN).catch(err => {
  console.error('❌ Nie udało się zalogować bota:', err.message);
  process.exit(1);
});
