const fs = require('fs');
let code = fs.readFileSync('discord-bot/index.js', 'utf8');

const regex = /const stateRes = await apiGet\(\`\/roulette\/state\?rouletteId=\\\$\{\rouletteId\}\`\);\n           \n           const targetOptions = stateRes\.alivePlayers/g;
const repl = "/* already fetched stateRes earlier in the block */\n           const targetOptions = stateRes.alivePlayers";
code = code.replace(regex, repl);

fs.writeFileSync('discord-bot/index.js', code);
