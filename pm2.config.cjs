/**
 * PM2 Ecosystem Config — BCSE 3D Printer Lab Manager
 *
 * Start:   pm2 start pm2.config.cjs --env production
 * Stop:    pm2 stop bcse-3d-lab
 * Logs:    pm2 logs bcse-3d-lab
 * Monitor: pm2 monit
 * Save:    pm2 save  (persist across reboots)
 * Startup: pm2 startup  (then run the printed command as root)
 */
module.exports = {
  apps: [
    {
      name: 'bcse-3d-lab',
      script: 'npm',
      args: 'run start',
      cwd: __dirname,  // always resolve relative to config file location

      // CRITICAL: SQLite (better-sqlite3) is synchronous — single process only.
      // Do NOT use cluster mode or instances > 1 with SQLite.
      instances: 1,
      exec_mode: 'fork',

      // Auto-restart on memory leak
      max_memory_restart: '512M',

      // Restart policy
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,

      watch: false,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // ALLOWED_ORIGINS, JWT_SECRET, DATA_DIR, SMTP_* should be set in .env.production
        // and loaded via: pm2 start pm2.config.cjs --env production --env-file .env.production
      },
    },
  ],
};
