const Builder = require('@discordjs/builders');
const Fs = require('fs');
const Path = require('path');
const Config = require('../../config');

const allowedUserIds = ['1012761636706209872', '274913774127808533']; // Разрешенные ID пользователей

module.exports = {
    name: 'reset_credentials_bot',

    getData(client, guildId) {
        return new Builder.SlashCommandBuilder()
            .setName('reset_credentials_bot')
            .setDescription('Удалить каталог ./credentials и перезапустить бота')
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

        // Удаление каталога ./credentials
        const credentialsPath = Path.join(__dirname, '../../credentials');
        if (Fs.existsSync(credentialsPath)) {
            Fs.rmSync(credentialsPath, { recursive: true, force: true });
            await interaction.reply({ content: 'Каталог ./credentials удален. Перезапуск бота...', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Каталог ./credentials не найден. Перезапуск бота...', ephemeral: true });
        }

        // Завершение процесса Node.js
        process.exit(0);
    },
};