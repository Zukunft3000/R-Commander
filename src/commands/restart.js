const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'restart',

	getData(client, guildId) {
		return new SlashCommandBuilder()
			.setName('restart')
			.setDescription('Перезапустить бота');
	},

	async execute(client, interaction) {
		if (!await client.validatePermissions(interaction)) return;

		await interaction.reply({ content: 'Перезапуск бота...', ephemeral: true });

		// Завершение процесса Node.js
		process.exit(0);
	},
};