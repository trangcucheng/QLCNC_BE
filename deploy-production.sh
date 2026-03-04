#!/bin/bash

echo "🚀 Deploying QLCD Backend to Production Server..."

# Cấu hình server
SERVER_IP="your_server_ip"
SERVER_USER="your_server_user" 
PROJECT_DIR="/home/your_user/QLCD_BE"
BACKUP_DIR="/home/your_user/backups"

echo "📋 Step 1: Creating backup..."
ssh $SERVER_USER@$SERVER_IP "
    mkdir -p $BACKUP_DIR
    cd $PROJECT_DIR
    tar -czf $BACKUP_DIR/qlcd_backup_$(date +%Y%m%d_%H%M%S).tar.gz .
    echo '✅ Backup created'
"

echo "📋 Step 2: Uploading files to server..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude 'imageStaff' \
    ./ $SERVER_USER@$SERVER_IP:$PROJECT_DIR/

# Upload production env file
scp .env.production $SERVER_USER@$SERVER_IP:$PROJECT_DIR/.env

echo "📋 Step 3: Installing dependencies and building..."
ssh $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    npm install --production=false
    npm run build
    echo '✅ Build completed'
"

echo "📋 Step 4: Running database migrations..."
ssh $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    npm run migration:run
    echo '✅ Migrations completed'
"

echo "📋 Step 5: Restarting PM2 services..."
ssh $SERVER_USER@$SERVER_IP "
    cd $PROJECT_DIR
    pm2 reload ecosystem.config.js --env production
    pm2 save
    echo '✅ PM2 services reloaded'
"

echo "📋 Step 6: Health check..."
sleep 10
HEALTH_CHECK=$(ssh $SERVER_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health || echo 'FAILED'")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "🎉 Deployment successful! Server is responding."
else
    echo "❌ Health check failed. Rolling back..."
    ssh $SERVER_USER@$SERVER_IP "
        cd $PROJECT_DIR
        pm2 stop all
        echo 'Please check logs and restore from backup if needed'
    "
fi

echo "🔍 Final status check..."
ssh $SERVER_USER@$SERVER_IP "pm2 status"
