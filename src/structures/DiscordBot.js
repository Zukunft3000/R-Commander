const fs = require('fs');
const { Collection, Client } = require('discord.js');
const Config = require('../../config.json');
const RustPlus = require('../structures/RustPlus');
const Logger = require('./Logger.js');
const path = require('path');
const Items = require('./Items');

class DiscordBot extends Client {
    constructor(props) {
        super(props);

        this.logger = new Logger(path.join(__dirname, '..', 'logs/discordBot.log'), 'default');

        this.commands = new Collection();
        this.rustplusInstances = new Object();
        this.currentFcmListeners = new Object();
        this.switchesMessages = new Object();
        this.storageMonitorsMessages = new Object();

        this.items = new Items();

        this.pollingIntervalMs = Config.general.pollingIntervalMs;

        this.loadCommands();
        this.loadEvents();
    }

    loadCommands() {
        const commandFiles = fs.readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            this.commands.set(command.data.name, command);
        }
    }

    loadEvents() {
        const discordEventFiles = fs.readdirSync(`${__dirname}/../discordEvents`).filter(file => file.endsWith('.js'));
        for (const file of discordEventFiles) {
            const event = require(`../discordEvents/${file}`);
            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args));
            } else {
                this.on(event.name, (...args) => event.execute(this, ...args));
            }
        }
    }

    build() {
        this.login(Config.discord.token).catch(error => {
            switch (error.code) {
                case 502: {
                    this.log('ERROR', `Bad Gateway: ${JSON.stringify(error)}`, 'error');
                } break;

                case 503: {
                    this.log('ERROR', `Service Unavailable: ${JSON.stringify(error)}`, 'error');
                } break;

                default: {
                    this.log('ERROR', `${JSON.stringify(error)}`, 'error');
                } break;
            }
        });
    }

    log(title, text, level = 'info') {
        this.logger.log(title, text, level);
    }

    async setupGuild(guild) {
        require('../util/CreateInstanceFile')(this, guild);
        require('../util/CreateCredentialsFile')(this, guild);

        /* If maps/ directory does not exist, create it */
        if (!fs.existsSync(`${__dirname}/../resources/images/maps`)) {
            fs.mkdirSync(`${__dirname}/../resources/images/maps`);
        }

        await require('../discordTools/RegisterSlashCommands')(this, guild);

        let category = await require('../discordTools/SetupGuildCategory')(this, guild);
        await require('../discordTools/SetupGuildChannels')(this, guild, category);

        require('../util/FcmListener')(this, guild);
        await require('../discordTools/SetupSettingsMenu')(this, guild);
    }

    readInstanceFile(guildId) {
        return JSON.parse(fs.readFileSync(`${__dirname}/../instances/${guildId}.json`, 'utf8'));
    }

    writeInstanceFile(guildId, instance) {
        fs.writeFileSync(`${__dirname}/../instances/${guildId}.json`, JSON.stringify(instance, null, 2));
    }

    readCredentialsFile(guildId) {
        return JSON.parse(fs.readFileSync(`${__dirname}/../credentials/${guildId}.json`, 'utf8'));
    }

    writeCredentialsFile(guildId, credentials) {
        fs.writeFileSync(`${__dirname}/../credentials/${guildId}.json`, JSON.stringify(credentials, null, 2));
    }

    readNotificationSettingsTemplate() {
        return JSON.parse(fs.readFileSync(`${__dirname}/../templates/notificationSettingsTemplate.json`, 'utf8'));
    }

    readGeneralSettingsTemplate() {
        return JSON.parse(fs.readFileSync(`${__dirname}/../templates/generalSettingsTemplate.json`, 'utf8'));
    }

    createRustplusInstance(guildId, serverIp, appPort, steamId, playerToken) {
        let rustplus = new RustPlus(guildId, serverIp, appPort, steamId, playerToken);

        /* Add rustplus instance to Object */
        this.rustplusInstances[guildId] = rustplus;

        rustplus.build();

        return rustplus;
    }

    createRustplusInstancesFromConfig() {
        /* If instances/ directory does not exist, create it */
        if (!fs.existsSync(`${__dirname}/../instances`)) {
            fs.mkdirSync(`${__dirname}/../instances`);
        }

        let files = fs.readdirSync(`${__dirname}/../instances`);

        files.forEach(file => {
            if (file.endsWith('.json')) {
                let guildId = file.replace('.json', '');
                let instance = this.readInstanceFile(guildId);

                for (const [key, value] of Object.entries(instance.serverList)) {
                    if (value.active) {
                        this.createRustplusInstance(
                            guildId,
                            value.serverIp,
                            value.appPort,
                            value.steamId,
                            value.playerToken);
                        break;
                    }
                }
            }
        });
    }

    async interactionUpdate(interaction, content) {
        try {
            return await interaction.update(content);
        }
        catch (e) {
            this.log('ERROR', `Interaction failed: ${e}`, 'error');
            for (let line of (new Error().stack.split(/\r?\n/))) {
                this.log('- ', `${line}`, 'error');
            }
        }

        return undefined;
    }

    async messageEdit(message, content) {
        try {
            return await message.edit(content);
        }
        catch (e) {
            this.log('ERROR', `Message edit failed: ${e}`, 'error');
            for (let line of (new Error().stack.split(/\r?\n/))) {
                this.log('- ', `${line}`, 'error');
            }
        }

        return undefined;
    }

    async messageSend(channel, content) {
        try {
            return await channel.send(content);
        }
        catch (e) {
            this.log('ERROR', `Message send failed: ${e}`, 'error');
            for (let line of (new Error().stack.split(/\r?\n/))) {
                this.log('- ', `${line}`, 'error');
            }
        }

        return undefined;
    }
}

module.exports = DiscordBot;
