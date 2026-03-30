const fs = require('fs');
let code = fs.readFileSync('discord-bot/index.js', 'utf8');

// Update 1 (Resume after draw decline)
const regex1 = /const targetOptions = stateRes\.alivePlayers\.map\(pId => \(\{\n               label: pId === stateRes\.turnPlayer \? 'Me tirer dessus \(Rejoue si ⚪\)' : \`Tirer sur un adversaire\`,\n               value: pId,\n               description: pId === stateRes\.turnPlayer \? 'Risqué mais récompense d\\'un tour' : 'Éliminer une menace'\n           \}\)\);/g;

const replacement1 = `// We need the actual display name. We can fetch it or just use the ping format which doesn't work in select menus.
           // In select menus, <@id> is literally text. We must resolve the user object if possible.
           // Since we can't reliably async-fetch all users in the map, we can rely on interaction.guild.members.cache
           // or just use generic text with the ID if we don't have it.
           // Let's try to fetch members if possible, or fallback to "Joueur".
           const targetOptions = await Promise.all(stateRes.alivePlayers.map(async pId => {
               let displayName = 'Joueur inconnu';
               try {
                   const member = await interaction.guild.members.fetch(pId);
                   displayName = member ? (member.displayName || member.user.username) : pId;
               } catch(e) { displayName = pId; }

               const lives = stateRes.playerLives[pId] || 0;
               const livesText = '🩷'.repeat(lives);

               return {
                   label: pId === stateRes.turnPlayer ? \`[TOI] \${displayName} (\${livesText})\` : \`\${displayName} (\${livesText})\`,
                   value: pId,
                   description: pId === stateRes.turnPlayer ? 'Me tirer dessus (Rejoue si ⚪)' : 'Tirer sur cet adversaire'
               };
           }));`;

code = code.replace(regex1, replacement1);


// Update 2 (Game start)
const regex2 = /const targetOptions = players\.map\(pId => \(\{\n               label: pId === startRes\.turnPlayer \? 'Me tirer dessus \(Rejoue si ⚪\)' : \`Tirer sur un adversaire\`,\n               value: pId,\n               description: pId === startRes\.turnPlayer \? 'Risqué mais récompense d\\'un tour' : 'Éliminer une menace'\n           \}\)\);/;

const replacement2 = `const targetOptions = await Promise.all(players.map(async pId => {
               let displayName = 'Joueur inconnu';
               try {
                   const member = await interaction.guild.members.fetch(pId);
                   displayName = member ? (member.displayName || member.user.username) : pId;
               } catch(e) { displayName = pId; }

               const livesText = '🩷'.repeat(startRes.startingLives);

               return {
                   label: pId === startRes.turnPlayer ? \`[TOI] \${displayName} (\${livesText})\` : \`\${displayName} (\${livesText})\`,
                   value: pId,
                   description: pId === startRes.turnPlayer ? 'Me tirer dessus (Rejoue si ⚪)' : 'Tirer sur cet adversaire'
               };
           }));`;

code = code.replace(regex2, replacement2);

fs.writeFileSync('discord-bot/index.js', code);
