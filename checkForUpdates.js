const axios = require('axios');
const localPackage = require('./package.json');
const client = require('./src/structures/DiscordBot');

function checkForUpdates() {
    const remoteUrl = 'https://raw.githubusercontent.com/alexemanuelol/rustplusplus/main/package.json';
    const local = localPackage;

    axios.get(remoteUrl)
        .then((response) => {
            const remote = response.data;

            if (remote.version !== local.version) {
                client.log(client.intlGet(null, 'infoCap'), client.intlGet(null, 'updateInfo', {
                    current: local.version,
                    new: remote.version
                }), 'warn');
            }
        })
        .catch((error) => {
            console.log(error);
        });
}
// Функция для отправки сообщений в вебхук Discord
async function sendToDiscordWebhook(message) {
    try {
        await axios.post(Config.discord.webhookerror, {
            content: message
        });
    } catch (error) {
        console.error('Ошибка при отправке сообщения в Discord вебхук:', error);
    }
}

// Функция для логирования ошибок в файл
function logErrorToFile(error, location) {
    const logMessage = `${new Date().toISOString()} - Error: ${error.message}, Location: ${location}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
}

process.on('unhandledRejection', async (error) => {
    if (error instanceof Error) {
        const stack = error.stack ? error.stack.split('\n') : [];
        const location = stack[1] ? stack[1].trim() : 'Unknown location';

        const errorMessage = `Unhandled Rejection at: ${location}\nError: ${error.message}`;

        if (!previousErrors.has(errorMessage)) {
            previousErrors.add(errorMessage);
            if (previousErrors.size > 50) {
                // Ограничиваем размер набора ошибок, чтобы избежать утечки памяти
                previousErrors.clear();
            }

            // Логируем ошибку в файл
            logErrorToFile(error, location);

            // Отправляем ошибку в вебхук Discord
            await sendToDiscordWebhook(errorMessage);
        }

        client.log(client.intlGet(null, 'errorCap'), client.intlGet(null, 'unhandledRejection', {
            error: error.message,
            location: location
        }), 'error');

        console.log(`Unhandled Rejection at: ${location}`);
        console.log(error);
    } else {
        const errorMessage = `Unhandled Rejection: ${String(error)}`;
        if (!previousErrors.has(errorMessage)) {
            previousErrors.add(errorMessage);
            if (previousErrors.size > 50) {
                // Ограничиваем размер набора ошибок, чтобы избежать утечки памяти
                previousErrors.clear();
            }

            // Логируем ошибку в файл
            logErrorToFile(new Error(String(error)), 'Unknown location');

            // Отправляем ошибку в вебхук Discord
            await sendToDiscordWebhook(errorMessage);
        }

        client.log(client.intlGet(null, 'errorCap'), `Unhandled Rejection: ${String(error)}`, 'error');
        console.log(`Unhandled Rejection: ${String(error)}`);
    }
});

module.exports = checkForUpdates;
