const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Category emoji mapping
const categoryEmojis = {
  'moderation': '🛡️ MODERACJA',
  'games': '🎮 GRY',
  'economy': '💰 EKONOMIA',
  'fun': '😂 ROZRYWKA',
  'utility': '📊 UTILITY',
  'ai': '🤖 AI',
  'social': '👥 SOCIAL',
  'misc': '📝 MISC',
  'music': '🎵 MUZYKA',
  'leveling': '⭐ POZIOMY',
  'stats': '📊 STATYSTYKI',
  'youtube': '📺 YOUTUBE',
  'reminders': '⏰ PRZYPOMNIENIA',
  'polls': '📊 ANKIETY'
};

// Build command-to-category mapping from file system
function buildCommandCategoryMap() {
  const commandToCategory = {};
  const commandFolders = ['moderation', 'games', 'utility', 'ai', 'youtube', 'economy', 'leveling', 'music', 'reminders', 'polls', 'fun', 'stats', 'social', 'misc'];
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(__dirname, '..', '..', 'commands', folder);
    if (fs.existsSync(commandsPath)) {
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          const command = require(filePath);
          const commandName = command.data?.name || file.replace('.js', '');
          commandToCategory[commandName] = folder;
        } catch (error) {
          console.error(`Error loading ${file}:`, error.message);
        }
      }
    }
  }
  
  return commandToCategory;
}

// Build command categories from client.commands
function buildCommandCategories(client) {
  const categories = {};
  const commandToCategory = buildCommandCategoryMap();
  
  // Get unique commands (avoid duplicates from aliases)
  const uniqueCommands = new Map();
  
  for (const [name, command] of client.commands) {
    const commandName = command.data?.name || command.name || name;
    if (!uniqueCommands.has(commandName)) {
      uniqueCommands.set(commandName, command);
    }
  }
  
  // Group commands by category
  for (const [name, command] of uniqueCommands) {
    const category = commandToCategory[name] || 'misc';
    
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push({
      name: name,
      description: command.data?.description || command.description || 'Brak opisu'
    });
  }
  
  return categories;
}

// Create embed pages (1-2 categories per page, max 25 fields)
function createPages(categories) {
  const pages = [];
  let currentPage = [];
  
  // Define category order
  const categoryOrder = ['moderation', 'games', 'economy', 'fun', 'utility', 'ai', 'social', 'misc', 'music', 'leveling', 'stats', 'youtube', 'reminders', 'polls'];
  
  for (const category of categoryOrder) {
    const commands = categories[category];
    if (!commands || commands.length === 0) continue;
    
    const categoryName = categoryEmojis[category] || category.toUpperCase();
    const commandsList = commands
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cmd => `\`/${cmd.name}\` - ${cmd.description}`)
      .join('\n');
    
    const field = {
      name: `${categoryName} (${commands.length} komend${commands.length === 1 ? 'a' : ''})`,
      value: commandsList.length > 1024 ? commandsList.substring(0, 1021) + '...' : commandsList,
      inline: false
    };
    
    // Check if adding this field would exceed limits
    // Max 2 categories per page or 25 fields per embed
    if (currentPage.length >= 2) {
      pages.push(currentPage);
      currentPage = [];
    }
    
    currentPage.push(field);
  }
  
  // Add remaining fields as last page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  return pages;
}

// Create embed for a specific page
function createEmbed(pages, pageIndex, author, totalCommands) {
  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`🤖 Komendy Bota - Strona ${pageIndex + 1}/${pages.length}`)
    .setDescription(`Lista wszystkich dostępnych komend (${totalCommands} komend)`)
    .addFields(pages[pageIndex])
    .setFooter({ 
      text: `Strona ${pageIndex + 1}/${pages.length} • Żądane przez ${author.tag}` 
    })
    .setTimestamp();
  
  return embed;
}

// Create navigation buttons
function createButtons(pageIndex, totalPages) {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_previous')
        .setLabel('◀️ Poprzednia')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageIndex === 0),
      new ButtonBuilder()
        .setCustomId('help_next')
        .setLabel('▶️ Następna')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pageIndex === totalPages - 1)
    );
  
  return row;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Wyświetla wszystkie dostępne komendy'),
  
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const author = isSlash ? interaction.user : interaction.author;
    
    try {
      // Build categories and pages
      const categories = buildCommandCategories(client);
      const pages = createPages(categories);
      
      // Count total unique commands
      let totalCommands = 0;
      for (const category in categories) {
        totalCommands += categories[category].length;
      }
      
      if (pages.length === 0) {
        const errorMessage = '❌ Nie znaleziono żadnych komend!';
        if (isSlash) {
          return await interaction.reply({ content: errorMessage, ephemeral: true });
        } else {
          return interaction.reply(errorMessage);
        }
      }
      
      let currentPage = 0;
      const embed = createEmbed(pages, currentPage, author, totalCommands);
      const buttons = createButtons(currentPage, pages.length);
      
      const message = isSlash 
        ? await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true })
        : await interaction.reply({ embeds: [embed], components: [buttons] });
      
      // Create collector for button interactions (5 minutes timeout)
      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === author.id && (i.customId === 'help_previous' || i.customId === 'help_next'),
        time: 300000 // 5 minutes = 300000ms
      });
      
      collector.on('collect', async (i) => {
        try {
          if (i.customId === 'help_previous' && currentPage > 0) {
            currentPage--;
          } else if (i.customId === 'help_next' && currentPage < pages.length - 1) {
            currentPage++;
          }
          
          const newEmbed = createEmbed(pages, currentPage, author, totalCommands);
          const newButtons = createButtons(currentPage, pages.length);
          
          await i.update({ embeds: [newEmbed], components: [newButtons] });
        } catch (error) {
          console.error('Error handling button interaction:', error);
        }
      });
      
      collector.on('end', async () => {
        try {
          // Disable buttons after timeout
          const disabledRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('help_previous')
                .setLabel('◀️ Poprzednia')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('help_next')
                .setLabel('▶️ Następna')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            );
          
          await message.edit({ components: [disabledRow] });
        } catch (error) {
          // Message might have been deleted or no longer accessible
          console.error('Error disabling buttons:', error);
        }
      });
      
    } catch (error) {
      console.error('Error in help command:', error);
      const errorMessage = '❌ Wystąpił błąd podczas wyświetlania pomocy!';
      
      if (isSlash) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } else {
        interaction.reply(errorMessage);
      }
    }
  },
};
