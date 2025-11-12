const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const socialPath = path.join(__dirname, '../../data/social.json');
const economyPath = path.join(__dirname, '../../data/economy.json');

function getSocial() {
  if (!fs.existsSync(socialPath)) {
    fs.writeFileSync(socialPath, '{}');
  }
  return JSON.parse(fs.readFileSync(socialPath, 'utf8'));
}

function getEconomy() {
  if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}');
  }
  return JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

function saveSocial(social) {
  fs.writeFileSync(socialPath, JSON.stringify(social, null, 2));
}

function saveEconomy(economy) {
  fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));
}

const pets = ['🐶 Pies', '🐱 Kot', '🐹 Chomik', '🐰 Królik', '🦊 Lis', '🐻 Miś', '🐼 Panda', '🦁 Lew', '🐯 Tygrys', '🐨 Koala'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adopt')
    .setDescription('Adoptuj zwierzaka'),
  
  async execute(interaction) {
    try {
      const user = interaction.user;
      const social = getSocial();
      const economy = getEconomy();

      if (!social[user.id]) {
        social[user.id] = { rep: 0, badges: [], achievements: [], partner: null, pet: null };
      }

      if (!economy[user.id]) {
        economy[user.id] = { balance: 0, bank: 0, inventory: [] };
      }

      if (social[user.id].pet) {
        return await interaction.reply({ content: '❌ Masz już zwierzaka!', ephemeral: true });
      }

      const cost = 500;
      if (economy[user.id].balance < cost) {
        return await interaction.reply({ 
          content: `❌ Potrzebujesz ${cost} 🪙 aby adoptować zwierzaka! Masz: ${economy[user.id].balance} 🪙`, 
          ephemeral: true 
        });
      }

      const randomPet = pets[Math.floor(Math.random() * pets.length)];
      
      economy[user.id].balance -= cost;
      social[user.id].pet = randomPet;
      
      saveSocial(social);
      saveEconomy(economy);

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('🐾 Adopcja Zwierzaka')
        .setDescription(`Gratulacje! Adoptowałeś **${randomPet}**!`)
        .addFields(
          { name: '💰 Koszt', value: `${cost} 🪙`, inline: true },
          { name: '💼 Pozostało', value: `${economy[user.id].balance} 🪙`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Błąd w komendzie adopt:', error);
      await interaction.reply({ content: '❌ Wystąpił błąd podczas adopcji zwierzaka!', ephemeral: true });
    }
  },
};
