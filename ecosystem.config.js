// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'qlcd-api',
      script: 'dist/src/main.js',           // <— sửa path
      instances: 'max',
      exec_mode: 'cluster',
      instance_var: 'INSTANCE_ID',
      node_args: '--max-old-space-size=2048',

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      time: true
    }
  ]
};
