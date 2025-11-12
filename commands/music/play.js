const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
  name: 'play',
  description: 'Odtwórz muzykę z YouTube',
  aliases: ['p'],
  async execute(message, args, client) {
    if (!message.member.voice.channel) {
      return message.reply('❌ Musisz być na kanale głosowym!');
    }

    if (!args[0]) {
      return message.reply('❌ Podaj link do YouTube lub nazwę utworu!');
    }

    const query = args.join(' ');

    try {
      await message.channel.send('🔍 Szukam utworu...');

      let video;
      if (play.yt_validate(query) === 'video') {
        video = await play.video_info(query);
      } else {
        const searchResult = await play.search(query, { limit: 1 });
        if (searchResult.length === 0) {
          return message.reply('❌ Nie znaleziono utworu!');
        }
        video = searchResult[0];
      }

      const stream = await play.stream(video.url);

      const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(stream.stream, { inputType: stream.type });

      player.play(resource);
      connection.subscribe(player);

      if (!client.musicQueue) client.musicQueue = new Map();
      client.musicQueue.set(message.guild.id, { connection, player, queue: [video] });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🎵 Teraz gra')
        .setDescription(`[${video.title}](${video.url})`)
        .addFields(
          { name: '👤 Kanał', value: video.channel.name, inline: true },
          { name: '⏱️ Czas', value: video.durationRaw, inline: true }
        )
        .setThumbnail(video.thumbnails[0].url)
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

      player.on(AudioPlayerStatus.Idle, () => {
        const queue = client.musicQueue.get(message.guild.id);
        if (queue) {
          queue.connection.destroy();
          client.musicQueue.delete(message.guild.id);
        }
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        client.musicQueue.delete(message.guild.id);
      });

    } catch (error) {
      console.error(error);
      
      if (error.message && error.message.includes('Sign in to confirm your age')) {
        return message.reply('❌ Ten film ma ograniczenie wieku! YouTube wymaga zalogowania dla takich filmów.\n💡 Spróbuj innego utworu bez ograniczenia wieku.');
      }
      
      if (error.message && error.message.includes('Video unavailable')) {
        return message.reply('❌ Film niedostępny! Może być zablokowany w Twoim regionie lub usunięty.');
      }
      
      message.reply('❌ Wystąpił błąd podczas odtwarzania muzyki! Spróbuj innego utworu.');
    }
  },
};
