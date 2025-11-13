const fs = require('fs');
const path = require('path');

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Analyzing command JSON output for fields >100 or >110 chars...\n');

const issues = [];
let cmdCount = 0;

// Recursive function to check all string fields in an object
function checkAllStrings(obj, path, commandFile) {
  if (typeof obj === 'string') {
    const len = obj.length;
    if (len > 110) {
      issues.push({
        file: commandFile,
        path: path,
        value: obj,
        length: len,
        severity: 'CRITICAL >110'
      });
      console.log(`❌ ${commandFile}`);
      console.log(`   Path: ${path}`);
      console.log(`   Length: ${len} chars (LIMIT: 110)`);
      console.log(`   Value: "${obj}"`);
      console.log('');
    } else if (len > 100) {
      issues.push({
        file: commandFile,
        path: path,
        value: obj,
        length: len,
        severity: 'WARNING >100'
      });
      console.log(`⚠️  ${commandFile}`);
      console.log(`   Path: ${path}`);
      console.log(`   Length: ${len} chars (LIMIT: 100)`);
      console.log(`   Value: "${obj}"`);
      console.log('');
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      checkAllStrings(item, `${path}[${index}]`, commandFile);
    });
  } else if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      checkAllStrings(value, `${path}.${key}`, commandFile);
    });
  }
}

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandsPath)) continue;
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandPath = `${folder}/${file}`;
    cmdCount++;
    
    try {
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      
      if (!command.data) {
        console.log(`⚠️  ${commandPath} - no data export`);
        continue;
      }
      
      const commandData = command.data.toJSON();
      
      // Check all string fields recursively
      checkAllStrings(commandData, `${commandPath}`, commandPath);
      
    } catch (error) {
      console.log(`⚠️  ${commandPath} - load error: ${error.message}`);
    }
  }
}

console.log('='.repeat(70));
console.log(`\n📊 SUMMARY:`);
console.log(`   Commands analyzed: ${cmdCount}`);
console.log(`   Issues found: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n❌ ALL ISSUES:');
  console.log('='.repeat(70));
  issues.forEach((issue, i) => {
    console.log(`\n${i + 1}. [${issue.severity}] ${issue.file}`);
    console.log(`   Path: ${issue.path}`);
    console.log(`   Length: ${issue.length} chars`);
    console.log(`   Value: "${issue.value.substring(0, 150)}${issue.value.length > 150 ? '...' : ''}"`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n🎯 ZNALEZIONO PROBLEM!`);
  console.log(`\nNajpoważniejsze problemy (>110 znaków):`);
  const critical = issues.filter(i => i.severity === 'CRITICAL >110');
  if (critical.length > 0) {
    critical.forEach(issue => {
      console.log(`  ❌ ${issue.file} → ${issue.path} (${issue.length} chars)`);
    });
  } else {
    console.log(`  ✅ Brak pól >110 znaków`);
  }
  
  console.log(`\nOstrzeżenia (>100 znaków):`);
  const warnings = issues.filter(i => i.severity === 'WARNING >100');
  if (warnings.length > 0) {
    warnings.forEach(issue => {
      console.log(`  ⚠️  ${issue.file} → ${issue.path} (${issue.length} chars)`);
    });
  } else {
    console.log(`  ✅ Brak pól >100 znaków`);
  }
} else {
  console.log('\n✅ All command fields are within Discord API limits!');
  console.log('   No strings >100 or >110 characters found in command definitions.');
  console.log('\n💡 If you\'re still getting the error when registering ALL commands,');
  console.log('   it might be due to:');
  console.log('   - Total payload size limit');
  console.log('   - Rate limiting');
  console.log('   - The 100 command limit for global commands');
}
