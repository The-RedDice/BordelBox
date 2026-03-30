const fs = require('fs');
let code = fs.readFileSync('discord-bot/index.js', 'utf8');

// 1. Update the start message to display starting lives.
const startMsgRegex = /let gameMsg = \`La partie de Buckshot commence avec \*\*\\\$\{\players.length\} joueurs\*\*\!\\\\n\\\\n\`;/;
const startMsgReplacement = `let gameMsg = \`La partie de Buckshot commence avec **\${players.length} joueurs** !\\nChaque joueur a **\${startRes.startingLives} vie(s)** 🩷.\\n\\n\`;`;
code = code.replace(startMsgRegex, startMsgReplacement);


// 2. Update stringSelectMenu for targeting to display lives (Requires fetching state early or returning it from shoot)
const turnEmbedRegex = /nextTurnMsg \+\= \`C'est au tour de <@\\\$\{\shootRes.nextPlayer\}> de jouer.\`;[\s\S]*?const turnEmbed/;
const turnEmbedReplacement = `nextTurnMsg += \`C'est au tour de <@\${shootRes.nextPlayer}> de jouer.\`;

           // Fetch state to display lives
           const stateRes = await apiGet(\`/roulette/state?rouletteId=\${rouletteId}\`);
           if (stateRes && stateRes.playerLives) {
               nextTurnMsg += '\\n\\n**Vies restantes :**\\n';
               for (const [p, lives] of Object.entries(stateRes.playerLives)) {
                  if (stateRes.alivePlayers.includes(p)) {
                     nextTurnMsg += \`- <@\${p}> : \${'🩷'.repeat(lives)}\\n\`;
                  }
               }
           }

           const turnEmbed`;
code = code.replace(turnEmbedRegex, turnEmbedReplacement);

// 3. Update the start targetOptions to show lives (from state too)
const startTurnEmbedRegex = /gameMsg \+\= \`C'est au tour de <@\\\$\{\startRes.turnPlayer\}> de jouer.\`;[\s\S]*?const turnEmbed/;
const startTurnEmbedReplacement = `gameMsg += \`C'est au tour de <@\${startRes.turnPlayer}> de jouer.\`;

           // Initially all players have startingLives
           gameMsg += '\\n\\n**Vies restantes :**\\n';
           for (const p of startRes.players) {
              gameMsg += \`- <@\${p}> : \${'🩷'.repeat(startRes.startingLives)}\\n\`;
           }

           const turnEmbed`;
code = code.replace(startTurnEmbedRegex, startTurnEmbedReplacement);

// 4. Update the shooting response logic to consider victimLivesRemaining
const resultMsgRegex = /if \(isLive\) \{[\s\S]*?\} else \{/;
const resultMsgReplacement = `const victimLivesRemaining = shootRes.victimLivesRemaining || 0;
        if (isLive) {
            resultMsg += \`💥 **BAM ! C'était une vraie balle 🔴 !**\\n\`;
            if (victimDied) {
               if (isSelf) {
                  resultMsg += \`<@\${userId}> s'effondre.\\n\`;
               } else {
                  resultMsg += \`<@\${targetId}> s'effondre.\\n\`;
               }
            } else {
               if (isSelf) {
                  resultMsg += \`<@\${userId}> perd une vie ! (Reste \${victimLivesRemaining} 🩷)\\n\`;
               } else {
                  resultMsg += \`<@\${targetId}> perd une vie ! (Reste \${victimLivesRemaining} 🩷)\\n\`;
               }
            }
        } else {`;
code = code.replace(resultMsgRegex, resultMsgReplacement);

// 5. Update the draw logic to fetch state and display lives before resuming
const drawResumeRegex = /resumeMsg \+\= \`C'est au tour de <@\\\$\{\res.nextPlayer\}> de jouer.\`;[\s\S]*?const turnEmbed/;
const drawResumeReplacement = `resumeMsg += \`C'est au tour de <@\${res.nextPlayer}> de jouer.\`;

         const stateRes = await apiGet(\`/roulette/state?rouletteId=\${rouletteId}\`);
         if (stateRes && stateRes.playerLives) {
             resumeMsg += '\\n\\n**Vies restantes :**\\n';
             for (const [p, lives] of Object.entries(stateRes.playerLives)) {
                if (stateRes.alivePlayers.includes(p)) {
                   resumeMsg += \`- <@\${p}> : \${'🩷'.repeat(lives)}\\n\`;
                }
             }
         }

         const turnEmbed`;
code = code.replace(drawResumeRegex, drawResumeReplacement);

fs.writeFileSync('discord-bot/index.js', code);
