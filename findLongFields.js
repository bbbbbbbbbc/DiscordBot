const fs = require('fs');
const path = require('path');

const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];

console.log('🔍 Analizowanie komend pod kątem długości pól...\n');

const issues = [];
let totalCommands = 0;

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (!fs.existsSync(commandsPath)) continue;
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    totalCommands++;
    
    try {
      // Clear require cache
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      
      if (!command.data) continue;
      
      const commandData = command.data.toJSON();
      const commandPath = `${folder}/${file}`;
      
      // Check command name
      if (commandData.name && commandData.name.length > 32) {
        issues.push({
          file: commandPath,
          field: 'Command name',
          value: commandData.name,
          length: commandData.name.length,
          limit: 32
        });
      }
      
      // Check command description
      if (commandData.description) {
        if (commandData.description.length > 100) {
          issues.push({
            file: commandPath,
            field: 'Command description',
            value: commandData.description,
            length: commandData.description.length,
            limit: 100
          });
        }
        if (commandData.description.length > 110) {
          issues.push({
            file: commandPath,
            field: 'Command description (>110)',
            value: commandData.description,
            length: commandData.description.length,
            limit: 110
          });
        }
      }
      
      // Check options
      if (commandData.options) {
        commandData.options.forEach((option, optIndex) => {
          const optionPath = `${commandPath} → option[${optIndex}] "${option.name}"`;
          
          // Option name
          if (option.name && option.name.length > 32) {
            issues.push({
              file: optionPath,
              field: 'Option name',
              value: option.name,
              length: option.name.length,
              limit: 32
            });
          }
          
          // Option description
          if (option.description) {
            if (option.description.length > 100) {
              issues.push({
                file: optionPath,
                field: 'Option description',
                value: option.description,
                length: option.description.length,
                limit: 100
              });
            }
            if (option.description.length > 110) {
              issues.push({
                file: optionPath,
                field: 'Option description (>110)',
                value: option.description,
                length: option.description.length,
                limit: 110
              });
            }
          }
          
          // Check choices
          if (option.choices) {
            option.choices.forEach((choice, choiceIndex) => {
              const choicePath = `${optionPath} → choice[${choiceIndex}]`;
              
              // Choice name
              if (choice.name) {
                if (choice.name.length > 100) {
                  issues.push({
                    file: choicePath,
                    field: 'Choice name',
                    value: choice.name,
                    length: choice.name.length,
                    limit: 100
                  });
                }
                if (choice.name.length > 110) {
                  issues.push({
                    file: choicePath,
                    field: 'Choice name (>110)',
                    value: choice.name,
                    length: choice.name.length,
                    limit: 110
                  });
                }
              }
              
              // Choice value (for strings)
              if (typeof choice.value === 'string') {
                if (choice.value.length > 100) {
                  issues.push({
                    file: choicePath,
                    field: 'Choice value',
                    value: choice.value,
                    length: choice.value.length,
                    limit: 100
                  });
                }
                if (choice.value.length > 110) {
                  issues.push({
                    file: choicePath,
                    field: 'Choice value (>110)',
                    value: choice.value,
                    length: choice.value.length,
                    limit: 110
                  });
                }
              }
            });
          }
          
          // Check subcommand options
          if (option.options) {
            option.options.forEach((subOpt, subOptIndex) => {
              const subOptPath = `${optionPath} → suboption[${subOptIndex}] "${subOpt.name}"`;
              
              if (subOpt.name && subOpt.name.length > 32) {
                issues.push({
                  file: subOptPath,
                  field: 'Suboption name',
                  value: subOpt.name,
                  length: subOpt.name.length,
                  limit: 32
                });
              }
              
              if (subOpt.description) {
                if (subOpt.description.length > 100) {
                  issues.push({
                    file: subOptPath,
                    field: 'Suboption description',
                    value: subOpt.description,
                    length: subOpt.description.length,
                    limit: 100
                  });
                }
                if (subOpt.description.length > 110) {
                  issues.push({
                    file: subOptPath,
                    field: 'Suboption description (>110)',
                    value: subOpt.description,
                    length: subOpt.description.length,
                    limit: 110
                  });
                }
              }
              
              // Check suboption choices
              if (subOpt.choices) {
                subOpt.choices.forEach((choice, choiceIndex) => {
                  const choicePath = `${subOptPath} → choice[${choiceIndex}]`;
                  
                  if (choice.name) {
                    if (choice.name.length > 100) {
                      issues.push({
                        file: choicePath,
                        field: 'Suboption choice name',
                        value: choice.name,
                        length: choice.name.length,
                        limit: 100
                      });
                    }
                    if (choice.name.length > 110) {
                      issues.push({
                        file: choicePath,
                        field: 'Suboption choice name (>110)',
                        value: choice.name,
                        length: choice.name.length,
                        limit: 110
                      });
                    }
                  }
                  
                  if (typeof choice.value === 'string') {
                    if (choice.value.length > 100) {
                      issues.push({
                        file: choicePath,
                        field: 'Suboption choice value',
                        value: choice.value,
                        length: choice.value.length,
                        limit: 100
                      });
                    }
                    if (choice.value.length > 110) {
                      issues.push({
                        file: choicePath,
                        field: 'Suboption choice value (>110)',
                        value: choice.value,
                        length: choice.value.length,
                        limit: 110
                      });
                    }
                  }
                });
              }
            });
          }
        });
      }
      
    } catch (error) {
      console.log(`⚠️  Błąd podczas wczytywania ${folder}/${file}:`, error.message);
    }
  }
}

console.log(`📊 Przeanalizowano ${totalCommands} komend\n`);

if (issues.length === 0) {
  console.log('✅ Nie znaleziono pól przekraczających limity!');
  console.log('\n💡 Sprawdzam inne możliwe problemy...\n');
  
  // Let's do a second pass and print all field lengths for debugging
  console.log('📋 Wszystkie pola string w komendach (top 20 najdłuższych):');
  const allFields = [];
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(__dirname, 'commands', folder);
    if (!fs.existsSync(commandsPath)) continue;
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      
      try {
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        if (!command.data) continue;
        
        const commandData = command.data.toJSON();
        const commandPath = `${folder}/${file}`;
        
        if (commandData.description) {
          allFields.push({
            file: commandPath,
            field: 'description',
            value: commandData.description,
            length: commandData.description.length
          });
        }
        
        if (commandData.options) {
          commandData.options.forEach((option, i) => {
            if (option.description) {
              allFields.push({
                file: commandPath,
                field: `option[${i}].description`,
                value: option.description,
                length: option.description.length
              });
            }
            
            if (option.choices) {
              option.choices.forEach((choice, j) => {
                if (choice.name) {
                  allFields.push({
                    file: commandPath,
                    field: `option[${i}].choice[${j}].name`,
                    value: choice.name,
                    length: choice.name.length
                  });
                }
                if (typeof choice.value === 'string') {
                  allFields.push({
                    file: commandPath,
                    field: `option[${i}].choice[${j}].value`,
                    value: choice.value,
                    length: choice.value.length
                  });
                }
              });
            }
          });
        }
      } catch (error) {
        // Skip
      }
    }
  }
  
  allFields.sort((a, b) => b.length - a.length);
  allFields.slice(0, 20).forEach(field => {
    console.log(`  ${field.length} chars | ${field.file} → ${field.field}`);
    console.log(`    "${field.value}"`);
  });
  
} else {
  console.log('❌ ZNALEZIONE PROBLEMY:\n');
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. 🚨 ${issue.file}`);
    console.log(`   Field: ${issue.field}`);
    console.log(`   Length: ${issue.length} chars (limit: ${issue.limit})`);
    console.log(`   Value: "${issue.value}"`);
    console.log('');
  });
  
  console.log(`\n📊 Łącznie znaleziono ${issues.length} problemów`);
}
