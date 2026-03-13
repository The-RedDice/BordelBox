require('dotenv').config({ path: '../.env' });
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  // Supprime toutes les commandes du serveur
  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
    { body: [] }
  );
  console.log('✅ Commandes du serveur supprimées');

  // Supprime aussi les commandes globales (si t'en avais)
  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: [] }
  );
  console.log('✅ Commandes globales supprimées');
})();