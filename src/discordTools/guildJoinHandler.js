const { EmbedBuilder } = require('discord.js');
const DiscordEmbeds = require('./discordEmbeds.js');
const DiscordButtons = require('./discordButtons.js');
const Config = require('../../config');

module.exports = async (client, guild) => {
    const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
    if (!channel) return;

    // Проверка времени добавления
    const botJoinDate = guild.members.me?.joinedAt;
    const serverAge = Date.now() - guild.createdAt;
    if (serverAge > 300_000 && (Date.now() - botJoinDate) > 120_000) return;

    // Динамическая статистика
    const serverCount = client.guilds.cache.size;
    const badgeURL = `https://img.shields.io/badge/Серверов-${serverCount}-orange?logo=serverless&style=flat-square`;

    const supportEmbed = new EmbedBuilder()
        .setColor(0xDD6E0F)
        .setTitle('🔗 Ссылки')
        .setDescription(
            `💬 [Техподдержка](${Config.general.supportServer})\n` +
            `❤️ [Поддержать разработчика](${Config.general.donatelink} "Спасибо за вашу поддержку!")`
        )
        .setFooter({ 
            text: `Работает на ${serverCount} серверах.`,
            iconURL: badgeURL
        })
        .setThumbnail(client.user.displayAvatarURL({ 
            format: 'png', 
            size: 512,
            dynamic: true 
        }))

    channel.send({ 
        embeds: [DiscordEmbeds.getHelpEmbed(guild.id), supportEmbed],
        components: DiscordButtons.getHelpButtons()
    }).catch(console.error);
};