const Builder = require('@discordjs/builders');
const Fs = require('fs');
const Path = require('path');
const Config = require('../../config');

const allowedUserIds = ['274913774127808533']; // Разрешенные ID пользователей

module.exports = {
    name: 'reset_servers_bot',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('reset_servers_bot')
            .setDescription('Удалить каталог ./instances и перезапустить бота')
            .addStringOption(option =>
                option.setName('confirm')
                    .setDescription('Введите "yes" для подтверждения')
                    .setRequired(true));
    },

    async execute(client, interaction) {
        // Проверка, является ли пользователь разрешенным
        if (!allowedUserIds.includes(interaction.user.id)) {
            await interaction.reply({ content: 'У вас нет прав для использования этой команды.', ephemeral: true });
            return;
        }

        const confirmation = interaction.options.getString('confirm');
        if (confirmation.toLowerCase() !== 'yes') {
            await interaction.reply({ content: 'Подтверждение не получено. Команда отменена.', ephemeral: true });
            return;
        }

        // Удаление каталога ./instances
        const instancesPath = Path.join(__dirname, '../../instances');
        if (Fs.existsSync(instancesPath)) {
            Fs.rmSync(instancesPath, { recursive: true, force: true });
            await interaction.reply({ content: 'Каталог ./instances удален. Перезапуск бота...', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Каталог ./instances не найден. Перезапуск бота...', ephemeral: true });
        }

        // Завершение процесса Node.js
        process.exit(0);
    },
};