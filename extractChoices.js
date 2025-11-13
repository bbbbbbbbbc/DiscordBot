const fs = require('fs');
const path = require('path');

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Ekstraktuję wszystkie choices z definicji komend...\n');

const allChoices = [];

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
      
      if (!command.data) continue;
      
      const commandData = command.data.toJSON();
      
      // Recursive function to check all options and suboptions
      function checkOptions(options, parentPath) {
        if (!options) return;
        
        options.forEach((option, i) => {
          const optPath = `${parentPath} → option[${i}]"${option.name}"`;
          
          if (option.choices) {
            option.choices.forEach((choice, j) => {
              const choicePath = `${optPath} → choice[${j}]`;
              const nameLen = choice.name ? choice.name.length : 0;
              const valLen = typeof choice.value === 'string' ? choice.value.length : 0;
              
              allChoices.push({
                file: commandPath,
                path: choicePath,
                name: choice.name,
                nameLength: nameLen,
                value: choice.value,
                valueLength: valLen,
                valueType: typeof choice.value
              });
              
              if (nameLen > 100 || valLen > 100) {
                console.log(`❌ PROBLEM FOUND in ${commandPath}:`);
                console.log(`   Path: ${choicePath}`);
                console.log(`   Choice name: "${choice.name}" (${nameLen} chars)`);
                console.log(`   Choice value: "${choice.value}" (${valLen} chars)`);
                console.log('');
              }
            });
          }
          
          // Check nested options (subcommands)
          if (option.options) {
            checkOptions(option.options, optPath);
          }
        });
      }
      
      checkOptions(commandData.options, commandPath);
      
    } catch (error) {
      console.log(`⚠️  Error loading ${commandPath}: ${error.message}`);
    }
  }
}

// Sort by length descending
allChoices.sort((a, b) => {
  const maxA = Math.max(a.nameLength, a.valueLength);
  const maxB = Math.max(b.nameLength, b.valueLength);
  return maxB - maxA;
});

console.log('📊 TOP 30 NAJDŁUŻSZYCH CHOICES:\n');
allChoices.slice(0, 30).forEach((choice, i) => {
  console.log(`${i + 1}. ${choice.file}`);
  console.log(`   Name: "${choice.name}" (${choice.nameLength} chars)`);
  console.log(`   Value: ${typeof choice.value === 'string' ? '"' + choice.value + '"' : choice.value} (${choice.valueLength} chars)`);
  console.log('');
});

console.log(`\n📊 Total choices analyzed: ${allChoices.length}`);

// Check for any over limits
const overLimit = allChoices.filter(c => c.nameLength > 100 || c.valueLength > 100);
if (overLimit.length > 0) {
  console.log(`\n❌ Found ${overLimit.length} choices exceeding 100 character limit!`);
} else {
  console.log('\n✅ All choices are within the 100 character limit.');
}
