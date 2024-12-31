/*
    Copyright (C) 2022 Alexander Emanuelsson (alexemanuelol)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    https://github.com/alexemanuelol/rustplusplus

*/

const Discord = require('discord.js');
const Path = require('path');

const BattlemetricsHandler = require('../handlers/battlemetricsHandler.js');
const Config = require('../../config');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        for (const guild of client.guilds.cache) {
            require('../util/CreateInstanceFile')(client, guild[1]);
            require('../util/CreateCredentialsFile')(client, guild[1]);
            client.fcmListenersLite[guild[0]] = new Object();
        }

        client.loadGuildsIntl();
        client.log(client.intlGet(null, 'infoCap'), client.intlGet(null, 'loggedInAs', {
            name: client.user.tag
        }));

        try {
            await client.user.setUsername(Config.discord.username);
        }
        catch (e) {
            client.log(client.intlGet(null, 'warningCap'), client.intlGet(null, 'ignoreSetUsername'));
        }

        try {
            await client.user.setAvatar(Config.discord.avatarUrl || Path.join(__dirname, '..', 'resources/images/rustplusplus_logo.png'));
        }
        catch (e) {
            client.log(client.intlGet(null, 'warningCap'), client.intlGet(null, 'ignoreSetAvatar'));
        }
// Устанавливаем начальное состояние
updatePresence();

function formatUptime(uptime) {
    const days = Math.floor(uptime / 86400); // 86400 секунд в дне
    const hours = Math.floor((uptime % 86400) / 3600); // 3600 секунд в часе
    const minutes = Math.floor((uptime % 3600) / 60); // 60 секунд в минуте
    const seconds = Math.floor(uptime % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return `Uptime: ${parts.join(' ') || '0s'}`; // Если все нули, показываем '0s'
}

// Обновляем статус каждую минуту
setInterval(updatePresence, 60000); // 60000 мс = 1 минута
function updatePresence() {
const uptime = process.uptime(); // Получаем время работы бота в секундах
//const uptimeMessage = `Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`; // Форматируем сообщение
const uptimeMessage = formatUptime(uptime);
let lastUpdated = new Date(); // Обновляем время последнего обновления

const lastUpdatedMessage = `${lastUpdated.toLocaleTimeString()}`; // Форматируем сообщение о последнем обновлении

// Обновляем статус с описанием
client.user.setPresence({
        activities: [{ name: `/help ${uptimeMessage} | ${lastUpdatedMessage}`, type: Discord.ActivityType.Listening }],
        status: 'online'
    });
}

    client.uptimeBot = new Date();

    for (let guildArray of client.guilds.cache) {
        const guild = guildArray[1];

        try {
            await guild.members.me.setNickname(Config.discord.username);
        }
        catch (e) {
            client.log(client.intlGet(null, 'warningCap'), client.intlGet(null, 'ignoreSetNickname'));
        }
        await client.syncCredentialsWithUsers(guild);
        await client.setupGuild(guild);
    }

    await client.updateBattlemetricsInstances();
    BattlemetricsHandler.handler(client, true);
    client.battlemetricsIntervalId = setInterval(BattlemetricsHandler.handler, 60000, client, false);

    client.createRustplusInstancesFromConfig();
},
};