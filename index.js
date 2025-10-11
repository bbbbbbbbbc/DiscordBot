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

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats'];

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

client.once('clientReady', () => {
  console.log(`✅ Bot zalogowany jako ${client.user.tag}`);
  console.log(`🎮 Załadowano ${client.commands.size} komend`);
  client.user.setActivity('!help - Zobacz komendy', { type: 'PLAYING' });
});

const levelsPath = path.join(__dirname, 'data/levels.json');
const statsPath = path.join(__dirname, 'data/stats.json');
const automodPath = path.join(__dirname, 'data/automod.json');
const filterPath = path.join(__dirname, 'data/filter.json');

function getLevels() {
  if (!fs.existsSync(levelsPath)) fs.writeFileSync(levelsPath, '{}');
  return JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
}

function getStats() {
  if (!fs.existsSync(statsPath)) fs.writeFileSync(statsPath, '{}');
  return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
}

function getAutomod() {
  if (!fs.existsSync(automodPath)) fs.writeFileSync(automodPath, '{}');
  return JSON.parse(fs.readFileSync(automodPath, 'utf8'));
}

function getFilter() {
  if (!fs.existsSync(filterPath)) {
    const defaultFilter = { words: ['kurwa', 'chuj', 'dupek', 'idiota', 'debil'] };
    fs.writeFileSync(filterPath, JSON.stringify(defaultFilter, null, 2));
  }
  return JSON.parse(fs.readFileSync(filterPath, 'utf8'));
}

if (!client.messageTimestamps) client.messageTimestamps = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const automod = getAutomod();
  const guildConfig = automod[message.guild?.id];
  
  if (guildConfig?.enabled) {
    const filter = getFilter();
    const content = message.content.toLowerCase();
    
    if (guildConfig.antiProfanity) {
      for (const word of filter.words) {
        if (content.includes(word)) {
          await message.delete().catch(() => {});
          await message.channel.send(`${message.author} ❌ Nie używaj wulgaryzmów!`).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
          });
          return;
        }
      }
    }
    
    if (guildConfig.antiSpam) {
      const userId = message.author.id;
      const now = Date.now();
      
      if (!client.messageTimestamps.has(userId)) {
        client.messageTimestamps.set(userId, []);
      }
      
      const timestamps = client.messageTimestamps.get(userId);
      timestamps.push(now);
      
      const recentMessages = timestamps.filter(t => now - t < 5000);
      client.messageTimestamps.set(userId, recentMessages);
      
      if (recentMessages.length > 5) {
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author} ❌ Zwolnij! Nie spamuj!`).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
        return;
      }
    }
  }

  const levels = getLevels();
  if (!levels[message.author.id]) {
    levels[message.author.id] = { xp: 0, level: 0, messages: 0 };
  }
  
  levels[message.author.id].messages = (levels[message.author.id].messages || 0) + 1;
  
  const xpGain = Math.floor(Math.random() * 10) + 15;
  levels[message.author.id].xp += xpGain;
  
  const oldLevel = Math.floor(0.1 * Math.sqrt(levels[message.author.id].xp - xpGain));
  const newLevel = Math.floor(0.1 * Math.sqrt(levels[message.author.id].xp));
  
  if (newLevel > oldLevel) {
    const levelUpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎉 Awans!')
      .setDescription(`${message.author} osiągnął poziom **${newLevel}**!`)
      .setTimestamp();
    
    message.channel.send({ embeds: [levelUpEmbed] });
  }
  
  fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2));

  const stats = getStats();
  if (!stats[message.author.id]) {
    stats[message.author.id] = { messages: 0, commands: 0 };
  }
  stats[message.author.id].messages = (stats[message.author.id].messages || 0) + 1;
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || 
                  client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  stats[message.author.id].commands = (stats[message.author.id].commands || 0) + 1;
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

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
