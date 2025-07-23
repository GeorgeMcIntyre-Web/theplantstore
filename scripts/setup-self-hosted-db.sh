#!/bin/bash

# Self-Hosted PostgreSQL Setup Script for DigitalOcean
# This script sets up PostgreSQL on the same droplet to save R225/month

echo "🚀 Setting up self-hosted PostgreSQL database..."
echo "💰 This will save you R225/month compared to managed database"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
echo "▶️ Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "🗄️ Creating database and user..."
sudo -u postgres createdb plantstore
sudo -u postgres createuser plantstore_user
sudo -u postgres psql -c "ALTER USER plantstore_user WITH PASSWORD 'your_secure_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE plantstore TO plantstore_user;"

# Configure PostgreSQL for production
echo "⚙️ Configuring PostgreSQL for production..."

# Backup original config
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup

# Get available memory (in MB)
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
SHARED_BUFFERS=$((TOTAL_MEM / 4))
EFFECTIVE_CACHE_SIZE=$((TOTAL_MEM * 3 / 4))

# Update PostgreSQL configuration
sudo tee -a /etc/postgresql/*/main/postgresql.conf > /dev/null <<EOF

# Performance optimizations for 2GB droplet
shared_buffers = ${SHARED_BUFFERS}MB
effective_cache_size = ${EFFECTIVE_CACHE_SIZE}MB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Connection settings
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

# Logging
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
log_error_verbosity = verbose
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_timezone = 'UTC'

# Autovacuum settings
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
EOF

# Configure pg_hba.conf for secure connections
echo "🔒 Configuring connection security..."
sudo tee /etc/postgresql/*/main/pg_hba.conf > /dev/null <<EOF
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Allow connections from your application
host    plantstore      plantstore_user 127.0.0.1/32            md5
EOF

# Restart PostgreSQL
echo "🔄 Restarting PostgreSQL with new configuration..."
sudo systemctl restart postgresql

# Test connection
echo "🧪 Testing database connection..."
sudo -u postgres psql -d plantstore -c "SELECT version();"

# Create .env file with new database URL
echo "📝 Creating .env file with local database URL..."
cat > .env.local <<EOF
# Database Configuration (Self-hosted PostgreSQL)
DATABASE_URL="postgresql://plantstore_user:your_secure_password_here@localhost:5432/plantstore"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"

# Environment
NODE_ENV="production"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Payment Configuration (Paystack)
PAYSTACK_SECRET_KEY="your-paystack-secret-key"
PAYSTACK_PUBLIC_KEY="your-paystack-public-key"

# Email Configuration (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@your-domain.com"
SENDGRID_FROM_NAME="The House Plant Store"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Shipping Configuration
COURIER_GUY_API_KEY="your-courier-guy-api-key"
COURIER_GUY_USERNAME="your-username"
COURIER_GUY_PASSWORD="your-password"
EOF

# Install monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt install htop iotop -y

# Create monitoring script
cat > monitor-db.sh <<'EOF'
#!/bin/bash
echo "=== PostgreSQL Status ==="
sudo systemctl status postgresql --no-pager -l

echo -e "\n=== Database Connections ==="
sudo -u postgres psql -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

echo -e "\n=== Database Size ==="
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('plantstore'));"

echo -e "\n=== System Resources ==="
free -h
df -h /
EOF

chmod +x monitor-db.sh

# Create backup script
cat > backup-db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="plantstore_backup_$DATE.sql"

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Create backup
sudo -u postgres pg_dump plantstore > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

echo "Backup created: $BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "plantstore_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Set up daily backup cron job
echo "📅 Setting up daily backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/plant-store/backup-db.sh") | crontab -

echo ""
echo "✅ Self-hosted PostgreSQL setup complete!"
echo ""
echo "💰 Cost savings: R225/month (compared to managed database)"
echo "📊 Annual savings: R2,700/year"
echo ""
echo "🔧 Next steps:"
echo "1. Update your .env file with the new DATABASE_URL"
echo "2. Run database migrations: npx prisma db push"
echo "3. Seed the database: npm run seed"
echo "4. Test the application"
echo ""
echo "📈 Monitoring:"
echo "- Run ./monitor-db.sh to check database status"
echo "- Run ./backup-db.sh to create manual backup"
echo "- Daily backups will run at 2 AM automatically"
echo ""
echo "🔒 Security:"
echo "- Change 'your_secure_password_here' to a strong password"
echo "- Update firewall rules if needed"
echo "- Consider setting up SSL for database connections" 