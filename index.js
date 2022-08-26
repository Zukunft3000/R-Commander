const Discord = require('discord.js');
const Fs = require('fs');

const DiscordBot = require('./src/structures/DiscordBot');

createMissingDirectories();

const client = new DiscordBot({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent],
    retryLimit: 2,
    restRequestTimeout: 60000,
    disableEveryone: false
});

client.build();

function createMissingDirectories() {
    if (!Fs.existsSync(`${__dirname}/src/logs`)) {
        Fs.mkdirSync(`${__dirname}/src/logs`);
    }

    if (!Fs.existsSync(`${__dirname}/src/instances`)) {
        Fs.mkdirSync(`${__dirname}/src/instances`);
    }

    if (!Fs.existsSync(`${__dirname}/src/credentials`)) {
        Fs.mkdirSync(`${__dirname}/src/credentials`);
    }

    if (!Fs.existsSync(`${__dirname}/src/resources/images/maps`)) {
        Fs.mkdirSync(`${__dirname}/src/resources/images/maps`);
    }
}

exports.client = client;
