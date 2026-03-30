const fs = require('fs');
let code = fs.readFileSync('discord-bot/index.js', 'utf8');

const regex1 = /let gameMsg = \`La partie de Buckshot commence avec \*\*\\\$\{\players\.length\}\ joueurs\*\*\!\\\\n\\\\n\`;/;
code = code.replace(regex1, "let gameMsg = `La partie de Buckshot commence avec **${players.length} joueurs** !\\nChaque joueur a **${startRes.startingLives} vie(s)** 🩷.\\n\\n`;");

const regex2 = /gameMsg \+\= \`C'est au tour de <@\\\$\{\startRes\.turnPlayer\}> de jouer\.\`;\n\n           const turnEmbed/;
code = code.replace(regex2, "gameMsg += `C'est au tour de <@${startRes.turnPlayer}> de jouer.`;\n\n           gameMsg += '\\n\\n**Vies restantes :**\\n';\n           for (const p of startRes.players) {\n              gameMsg += `- <@${p}> : ${'🩷'.repeat(startRes.startingLives)}\\n`;\n           }\n\n           const turnEmbed");

const regex3 = /nextTurnMsg \+\= \`C'est au tour de <@\\\$\{\shootRes\.nextPlayer\}> de jouer\.\`;\n\n           const turnEmbed/g;
const repl3 = "nextTurnMsg += `C'est au tour de <@${shootRes.nextPlayer}> de jouer.`;\n           \n           const stateRes = await apiGet(`/roulette/state?rouletteId=${rouletteId}`);\n           if (stateRes && stateRes.playerLives) {\n               nextTurnMsg += '\\n\\n**Vies restantes :**\\n';\n               for (const [p, lives] of Object.entries(stateRes.playerLives)) {\n                  if (stateRes.alivePlayers.includes(p)) {\n                     nextTurnMsg += `- <@${p}> : ${'🩷'.repeat(lives)}\\n`;\n                  }\n               }\n           }\n\n           const turnEmbed";
code = code.replace(regex3, repl3);

const regex4 = /if \(isLive\) \{\n            resultMsg \+\= \`💥 \*\*BAM \! C'était une vraie balle 🔴 \!\*\*\\\\n\`;\n            if \(isSelf\) \{\n               resultMsg \+\= \`<@\\\$\{\userId\}> s'effondre\.\\\\n\`;\n            \} else \{\n               resultMsg \+\= \`<@\\\$\{\targetId\}> s'effondre\.\\\\n\`;\n            \}\n        \} else \{/g;
const repl4 = "const victimLivesRemaining = shootRes.victimLivesRemaining || 0;\n        if (isLive) {\n            resultMsg += `💥 **BAM ! C'était une vraie balle 🔴 !**\\n`;\n            if (victimDied) {\n               if (isSelf) {\n                  resultMsg += `<@${userId}> s'effondre.\\n`;\n               } else {\n                  resultMsg += `<@${targetId}> s'effondre.\\n`;\n               }\n            } else {\n               if (isSelf) {\n                  resultMsg += `<@${userId}> perd une vie ! (Reste ${victimLivesRemaining} 🩷)\\n`;\n               } else {\n                  resultMsg += `<@${targetId}> perd une vie ! (Reste ${victimLivesRemaining} 🩷)\\n`;\n               }\n            }\n        } else {";
code = code.replace(regex4, repl4);


const regex5 = /resumeMsg \+\= \`C'est au tour de <@\\\$\{\res\.nextPlayer\}> de jouer\.\`;\n\n         const turnEmbed/;
const repl5 = "resumeMsg += `C'est au tour de <@${res.nextPlayer}> de jouer.`;\n         \n         const stateRes = await apiGet(`/roulette/state?rouletteId=${rouletteId}`);\n         if (stateRes && stateRes.playerLives) {\n             resumeMsg += '\\n\\n**Vies restantes :**\\n';\n             for (const [p, lives] of Object.entries(stateRes.playerLives)) {\n                if (stateRes.alivePlayers.includes(p)) {\n                   resumeMsg += `- <@${p}> : ${'🩷'.repeat(lives)}\\n`;\n                }\n             }\n         }\n\n         const turnEmbed";
code = code.replace(regex5, repl5);


fs.writeFileSync('discord-bot/index.js', code);
