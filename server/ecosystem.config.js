module.exports = {
  apps: [
    {
      name: 'API',
      script: './dist/index.js',

      instances: 1,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
