const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_BOT_TOKEN || !CLIENT_ID) {
  console.log('❌ Brak DISCORD_BOT_TOKEN lub CLIENT_ID!');
  process.exit(1);
}

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Testowanie komend pojedynczo...\n');

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  const successfulCommands = [];
  const failedCommands = [];
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(__dirname, 'commands', folder);
    if (!fs.existsSync(commandsPath)) continue;
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandPath = `${folder}/${file}`;
      
      try {
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if (!('data' in command)) {
          console.log(`⚠️  ${commandPath} - brak data`);
          continue;
        }
        
        const commandData = command.data.toJSON();
        
        // Próba walidacji przez Discord API
        try {
          // Print full command data for debugging
          const jsonStr = JSON.stringify(commandData, null, 2);
          
          if (GUILD_ID) {
            await rest.put(
              Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
              { body: [commandData] }
            );
          } else {
            // Just validate locally without sending
            console.log(`📝 ${commandPath} (${commandData.name})`);
            console.log(`   Description: ${commandData.description} (${commandData.description.length} chars)`);
            
            // Check all string fields in detail
            if (commandData.options) {
              commandData.options.forEach((opt, i) => {
                console.log(`   Option ${i}: ${opt.name} - ${opt.description} (${opt.description?.length || 0} chars)`);
                
                if (opt.choices) {
                  opt.choices.forEach((choice, j) => {
                    const nameLen = choice.name?.length || 0;
                    const valLen = typeof choice.value === 'string' ? choice.value.length : 0;
                    console.log(`     Choice ${j}: name="${choice.name}" (${nameLen} chars), value="${choice.value}" (${valLen} chars)`);
                    
                    if (nameLen > 100 || valLen > 100 || nameLen > 110 || valLen > 110) {
                      console.log(`       ⚠️ UWAGA: choice przekracza limit!`);
                    }
                  });
                }
                
                // Check suboptions
                if (opt.options) {
                  opt.options.forEach((subopt, k) => {
                    console.log(`     Suboption ${k}: ${subopt.name} - ${subopt.description} (${subopt.description?.length || 0} chars)`);
                    
                    if (subopt.choices) {
                      subopt.choices.forEach((choice, m) => {
                        const nameLen = choice.name?.length || 0;
                        const valLen = typeof choice.value === 'string' ? choice.value.length : 0;
                        console.log(`       Choice ${m}: name="${choice.name}" (${nameLen} chars), value="${choice.value}" (${valLen} chars)`);
                        
                        if (nameLen > 100 || valLen > 100 || nameLen > 110 || valLen > 110) {
                          console.log(`         ⚠️ UWAGA: choice przekracza limit!`);
                        }
                      });
                    }
                  });
                }
              });
            }
            
            // Calculate total JSON size
            const totalSize = jsonStr.length;
            console.log(`   Total JSON size: ${totalSize} bytes`);
            
            if (totalSize > 4000) {
              console.log(`   ⚠️ WARNING: Large command data!`);
            }
          }
          
          successfulCommands.push(commandPath);
          console.log(`✅ ${commandPath}`);
          
        } catch (apiError) {
          failedCommands.push({
            path: commandPath,
            name: commandData.name,
            error: apiError.message,
            rawError: apiError.rawError,
            data: commandData
          });
          
          console.log(`❌ ${commandPath} - BŁĄD!`);
          console.log(`   Komenda: ${commandData.name}`);
          console.log(`   Error: ${apiError.message}`);
          
          if (apiError.rawError) {
            console.log(`   Raw Error:`, JSON.stringify(apiError.rawError, null, 2));
          }
          
          // Print detailed data for failed command
          console.log(`   Command Data:`, JSON.stringify(commandData, null, 2));
          console.log('');
        }
        
      } catch (error) {
        console.log(`⚠️  ${commandPath} - błąd wczytywania: ${error.message}`);
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Sukces: ${successfulCommands.length} komend`);
  console.log(`❌ Błędy: ${failedCommands.length} komend`);
  
  if (failedCommands.length > 0) {
    console.log('\n❌ PROBLEMATYCZNE KOMENDY:');
    failedCommands.forEach(cmd => {
      console.log(`\n🚨 ${cmd.path} (${cmd.name})`);
      console.log(`   Error: ${cmd.error}`);
      if (cmd.rawError) {
        console.log(`   Details:`, JSON.stringify(cmd.rawError, null, 2));
      }
    });
  }
})();
