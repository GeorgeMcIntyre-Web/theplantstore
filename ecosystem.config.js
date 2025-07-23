module.exports = {
  apps: [
    {
      name: 'plant-store',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/plant-store',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M', // Optimized for cost savings
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policy
      min_uptime: '10s',
      max_restarts: 10,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Performance - Optimized for cost savings
      node_args: '--max-old-space-size=512',
      
      // Environment variables (these should be set in your system)
      // DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
    }
  ],

  deploy: {
    production: {
      user: 'root', // or your server user
      host: process.env.SERVER_HOST || 'your-server-ip',
      ref: 'origin/main',
      repo: process.env.GITHUB_REPOSITORY || 'your-git-repo-url',
      path: '/var/www/plant-store',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --production=false && npx prisma generate && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/plant-store/logs'
    }
  }
}; 