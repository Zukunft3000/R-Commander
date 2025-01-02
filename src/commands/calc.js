const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordMessages = require('../discordTools/discordMessages.js');

module.exports = {
    name: 'calc',

    getData(client, guildId) {
        return new SlashCommandBuilder()
            .setName('calc')
            .setDescription(client.intlGet(guildId, 'commandsCalcDesc'))
            .addStringOption(option => option
                .setName('expression')
                .setDescription(client.intlGet(guildId, 'commandsCalcExpressionDesc'))
                .setRequired(true));
    },

    async execute(client, interaction) {
        await this.executeCommand(client, interaction);

        DiscordMessages.sendApplicationCommandInteractionMessage(interaction);
    },

    async executeCommand(client, interaction) {
        const rustplus = client.rustplusInstances[interaction.guildId];

        const verifyId = Math.floor(100000 + Math.random() * 900000);
        client.logInteraction(interaction, verifyId, 'slashCommand');

        if (!await client.validatePermissions(interaction)) return;
        await interaction.deferReply({ ephemeral: true });

        const expression = interaction.options.getString('expression');
        let result;

        // Проверка на наличие только допустимых символов (цифры, операторы, пробелы, точки, скобки)
        const validExpression = /^[\d\s+\-*/().,]+$/.test(expression);
        if (!validExpression) {
            result = client.intlGet(interaction.guildId, 'commandsCalcError');
        } else {
            try {
                // Выполнение только допустимых математических выражений
                result = Function('"use strict";return (' + expression + ')')();
            } catch (error) {
                result = client.intlGet(interaction.guildId, 'commandsCalcError');
            }
        }

        const response = client.intlGet(interaction.guildId, 'commandsCalcResult', { expression, result });

        client.log(client.intlGet(null, 'infoCap'), client.intlGet(null, 'slashCommandValueChange', {
            id: `${verifyId}`,
            value: `${expression}`
        }));

        await DiscordMessages.sendCalcMessage(interaction, response);
        client.log(client.intlGet(null, 'infoCap'), client.intlGet(interaction.guildId, 'commandsCalcDesc'));
    },
};
