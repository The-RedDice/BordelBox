const fs = require('fs');
let code = fs.readFileSync('discord-bot/index.js', 'utf8');

const startMsgRegex = /let gameMsg = \`La partie de Buckshot commence avec \*\*\\\$\{\players\.length\} joueurs\*\* \!\\\\n\\\\n\`;/;
code = code.replace(startMsgRegex, "let gameMsg = `La partie de Buckshot commence avec **${players.length} joueurs** !\\nChaque joueur a **${startRes.startingLives} vie(s)** 🩷.\\n\\n`;");

const turnMsgRegex = /gameMsg \+\= \`C'est au tour de <@\\\$\{\startRes\.turnPlayer\}> de jouer\.\`;\n\n           const turnEmbed/;
code = code.replace(turnMsgRegex, "gameMsg += `C'est au tour de <@${startRes.turnPlayer}> de jouer.`;\n\n           gameMsg += '\\n\\n**Vies restantes :**\\n';\n           for (const p of startRes.players) {\n              gameMsg += `- <@${p}> : ${'🩷'.repeat(startRes.startingLives)}\\n`;\n           }\n\n           const turnEmbed");

const nextTurnRegex = /nextTurnMsg \+\= \`C'est au tour de <@\\\$\{\shootRes\.nextPlayer\}> de jouer\.\`;\n\n           const turnEmbed/;
code = code.replace(nextTurnRegex, "nextTurnMsg += `C'est au tour de <@${shootRes.nextPlayer}> de jouer.`;\n           \n           const stateRes = await apiGet(`/roulette/state?rouletteId=${rouletteId}`);\n           if (stateRes && stateRes.playerLives) {\n               nextTurnMsg += '\\n\\n**Vies restantes :**\\n';\n               for (const [p, lives] of Object.entries(stateRes.playerLives)) {\n                  if (stateRes.alivePlayers.includes(p)) {\n                     nextTurnMsg += `- <@${p}> : ${'🩷'.repeat(lives)}\\n`;\n                  }\n               }\n           }\n\n           const turnEmbed");

const resumeMsgRegex = /resumeMsg \+\= \`C'est au tour de <@\\\$\{\res\.nextPlayer\}> de jouer\.\`;\n\n         const turnEmbed/;
code = code.replace(resumeMsgRegex, "resumeMsg += `C'est au tour de <@${res.nextPlayer}> de jouer.`;\n         \n         const stateRes = await apiGet(`/roulette/state?rouletteId=${rouletteId}`);\n         if (stateRes && stateRes.playerLives) {\n             resumeMsg += '\\n\\n**Vies restantes :**\\n';\n             for (const [p, lives] of Object.entries(stateRes.playerLives)) {\n                if (stateRes.alivePlayers.includes(p)) {\n                   resumeMsg += `- <@${p}> : ${'🩷'.repeat(lives)}\\n`;\n                }\n             }\n         }\n\n         const turnEmbed");


const boomRegex = /if \(isLive\) \{\n            resultMsg \+\= \`💥 \*\*BAM \! C'était une vraie balle 🔴 \!\*\*\\\\n\`;\n            if \(isSelf\) \{\n               resultMsg \+\= \`<@\\\$\{\userId\}> s'effondre\.\\\\n\`;\n            \} else \{\n               resultMsg \+\= \`<@\\\$\{\targetId\}> s'effondre\.\\\\n\`;\n            \}\n        \} else \{/;

code = code.replace(boomRegex, "const victimLivesRemaining = shootRes.victimLivesRemaining || 0;\n        const victimDied = shootRes.victimDied;\n        if (isLive) {\n            resultMsg += `💥 **BAM ! C'était une vraie balle 🔴 !**\\n`;\n            if (victimDied) {\n               if (isSelf) {\n                  resultMsg += `<@${userId}> s'effondre.\\n`;\n               } else {\n                  resultMsg += `<@${targetId}> s'effondre.\\n`;\n               }\n            } else {\n               if (isSelf) {\n                  resultMsg += `<@${userId}> perd une vie ! (Reste ${victimLivesRemaining} 🩷)\\n`;\n               } else {\n                  resultMsg += `<@${targetId}> perd une vie ! (Reste ${victimLivesRemaining} 🩷)\\n`;\n               }\n            }\n        } else {");

fs.writeFileSync('discord-bot/index.js', code);
