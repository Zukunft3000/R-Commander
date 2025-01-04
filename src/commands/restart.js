const { SlashCommandBuilder } = require('@discordjs/builders');
const allowedUserIds = ['274913774127808533']; // Разрешенные ID пользователей
module.exports = {
	name: 'restart',

	getData(client, guildId) {
		return new SlashCommandBuilder()
			.setName('restart')
			.setDescription('Перезапустить бота');
	},
    async execute(client, interaction) {
		await this.executeCommand(client, interaction)

		DiscordMessages.sendApplicationCommandInteractionMessage(interaction)
	},
	async executeCommand(client, interaction) {
		if (!await client.validatePermissions(interaction)) return;
         // Проверка, является ли пользователь разрешенным
        if (!allowedUserIds.includes(interaction.user.id)) {
	    await interaction.reply({ content: 'У вас нет прав для использования этой команды.', ephemeral: true });
	    return;
        }
		await interaction.reply({ content: 'Перезапуск бота...', ephemeral: true });

		// Завершение процесса Node.js
		process.exit(0);
	},
};