const fs = require('fs');
let code = fs.readFileSync('server/stats.js', 'utf8');

// Update createRoulette to add playerLives
code = code.replace(/alivePlayers: \[\], \/\/ populated when game starts\n    currentTurnIndex: 0,/g, "alivePlayers: [],\n    playerLives: {},\n    currentTurnIndex: 0,");

// Update startRoulette
const startRegex = /roulette\.state = 'playing';[\s\S]*?const magStats = loadMagazine\(roulette\);/;
const startReplacement = `roulette.state = 'playing';
  // Determine lives based on player count
  let startingLives = 1;
  if (roulette.players.length === 2) startingLives = 3;
  else if (roulette.players.length <= 4) startingLives = 2;

  roulette.playerLives = {};
  for (const p of roulette.players) {
      roulette.playerLives[p] = startingLives;
  }

  // Shuffle player order
  roulette.alivePlayers = [...roulette.players].sort(() => Math.random() - 0.5);
  roulette.currentTurnIndex = 0;

  const magStats = loadMagazine(roulette);`;
code = code.replace(startRegex, startReplacement);

// Update startRoulette return object to include lives
const startReturnRegex = /turnPlayer: roulette\.alivePlayers\[0\],[\s\S]*?blankCount: magStats\.blankCount/;
const startReturnReplacement = `turnPlayer: roulette.alivePlayers[0],
     liveCount: magStats.liveCount,
     blankCount: magStats.blankCount,
     startingLives: startingLives`;
code = code.replace(startReturnRegex, startReturnReplacement);

// Update shootRoulette logic
const shootRegex = /if \(isLive\) \{[\s\S]*?if \(isSelf\) \{[\s\S]*?keepTurn = true; \/\/ Shot self with blank = keep turn\n     \}\n  \}/;
const shootReplacement = `let victimLivesRemaining = roulette.playerLives[targetId] || 0;

  if (isLive) {
     // BOOM
     victimLivesRemaining--;
     roulette.playerLives[targetId] = victimLivesRemaining;

     if (victimLivesRemaining <= 0) {
         victimDied = true;
         const victimIndex = roulette.alivePlayers.indexOf(targetId);
         roulette.alivePlayers.splice(victimIndex, 1);

         // Adjust turn index if someone before the current player (or the player themselves) died
         if (victimIndex <= roulette.currentTurnIndex) {
             roulette.currentTurnIndex--;
         }
     }
  } else {
     // CLICK
     if (isSelf) {
         keepTurn = true; // Shot self with blank = keep turn
     }
  }`;
code = code.replace(shootRegex, shootReplacement);

// Update shootRoulette return to include lives
const shootReturnRegex = /victim: targetId,\n         victimDied,\n         keepTurn,/g;
const shootReturnReplacement = `victim: targetId,
         victimDied,
         victimLivesRemaining,
         keepTurn,`;
code = code.replace(shootReturnRegex, shootReturnReplacement);

// Also need to update the other return objects in shootRoulette (finished and draw_proposed)
const shootReturnFinishRegex = /victim: targetId,\n         victimDied,\n         winner,/g;
const shootReturnFinishReplacement = `victim: targetId,
         victimDied,
         victimLivesRemaining,
         winner,`;
code = code.replace(shootReturnFinishRegex, shootReturnFinishReplacement);

const shootReturnDrawRegex = /victim: targetId,\n         victimDied,\n         alive: roulette\.alivePlayers,/g;
const shootReturnDrawReplacement = `victim: targetId,
         victimDied,
         victimLivesRemaining,
         alive: roulette.alivePlayers,`;
code = code.replace(shootReturnDrawRegex, shootReturnDrawReplacement);


// Update getRouletteState to include lives
const stateRegex = /turnPlayer: roulette\.alivePlayers\[roulette\.currentTurnIndex\],/;
const stateReplacement = `turnPlayer: roulette.alivePlayers[roulette.currentTurnIndex],
       playerLives: roulette.playerLives,`;
code = code.replace(stateRegex, stateReplacement);


fs.writeFileSync('server/stats.js', code);
