module.exports = {
  apps: [
    {
      name: 'plant-store',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/your/app', // Update this path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
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
      
      // Performance
      node_args: '--max-old-space-size=1024',
      
      // Environment variables (these should be set in your system)
      // DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
    }
  ],

  deploy: {
    production: {
      user: 'root', // or your server user
      host: 'your-server-ip',
      ref: 'origin/master',
      repo: 'your-git-repo-url',
      path: '/var/www/plant-store',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npx prisma generate && npx prisma db push && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 