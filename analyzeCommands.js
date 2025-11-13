const fs = require('fs');
const path = require('path');

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Analiza WSZYSTKICH pól string w komendach...\n');

function checkStringLengths(obj, cmdName, fieldPath = '') {
  const issues = [];
  
  if (typeof obj === 'string') {
    if (obj.length > 100) {
      issues.push({
        command: cmdName,
        field: fieldPath,
        length: obj.length,
        value: obj.substring(0, 80) + '...'
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      issues.push(...checkStringLengths(item, cmdName, `${fieldPath}[${index}]`));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = fieldPath ? `${fieldPath}.${key}` : key;
      issues.push(...checkStringLengths(value, cmdName, newPath));
    });
  }
  
  return issues;
}

let totalCommands = 0;
const allIssues = [];

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      
      if ('data' in command) {
        totalCommands++;
        const json = command.data.toJSON();
        const cmdName = `${folder}/${file} (${json.name})`;
        
        const issues = checkStringLengths(json, cmdName);
        allIssues.push(...issues);
      }
    }
  }
}

console.log(`📊 Przeskanowano ${totalCommands} komend\n`);

if (allIssues.length > 0) {
  console.log(`❌ Znaleziono ${allIssues.length} problemów:\n`);
  allIssues.forEach(issue => {
    console.log(`🔴 ${issue.command}`);
    console.log(`   Pole: ${issue.field}`);
    console.log(`   Długość: ${issue.length} znaków`);
    console.log(`   Wartość: "${issue.value}"`);
    console.log();
  });
} else {
  console.log('✅ Nie znaleziono żadnych pól >100 znaków');
}
