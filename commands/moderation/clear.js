const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Usuwa określoną liczbę wiadomości')
    .addIntegerOption(option =>
      option.setName('ilość')
        .setDescription('Liczba wiadomości do usunięcia (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction, args, client) {
    const isSlash = interaction.isChatInputCommand && interaction.isChatInputCommand();
    const member = isSlash ? interaction.member : interaction.member;
    const channel = isSlash ? interaction.channel : interaction.channel;

    if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      const message = '❌ Nie masz uprawnień do usuwania wiadomości!';
      if (isSlash) {
        return await interaction.reply({ content: message, ephemeral: true });
      } else {
        return interaction.reply(message);
      }
    }

    let amount;
    if (isSlash) {
      amount = interaction.options.getInteger('ilość');
    } else {
      amount = parseInt(args[0]);

      if (isNaN(amount) || amount < 1 || amount > 100) {
        return interaction.reply('❌ Podaj liczbę od 1 do 100 wiadomości do usunięcia!');
      }
    }

    try {
      if (isSlash) {
        await interaction.deferReply({ ephemeral: true });
        await channel.bulkDelete(amount, true);
        await interaction.editReply(`✅ Usunięto ${amount} wiadomości!`);
      } else {
        await channel.bulkDelete(amount + 1, true);
        const reply = await channel.send(`✅ Usunięto ${amount} wiadomości!`);
        setTimeout(() => reply.delete(), 3000);
      }
    } catch (error) {
      console.error(error);
      const message = '❌ Nie udało się usunąć wiadomości! (Wiadomości starsze niż 14 dni nie mogą być usunięte)';
      if (isSlash) {
        if (interaction.deferred) {
          await interaction.editReply(message);
        } else {
          await interaction.reply({ content: message, ephemeral: true });
        }
      } else {
        interaction.reply(message);
      }
    }
  },
};
