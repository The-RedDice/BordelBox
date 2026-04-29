module.exports = {
  apps: [
    {
      name: 'bordel-server',
      script: 'server.js',
      cwd: './server',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bordel-bot',
      script: 'index.js',
      cwd: './discord-bot',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
