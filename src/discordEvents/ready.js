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

// Обновляем статус каждую минуту
setInterval(updatePresence, 60000); // 60000 мс = 1 минута
function updatePresence() {
const uptime = process.uptime(); // Получаем время работы бота в секундах
const uptimeMessage = `Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`; // Форматируем сообщение
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