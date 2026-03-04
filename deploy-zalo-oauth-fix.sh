#!/bin/bash
# Deploy Zalo OAuth PKCE Fix

echo "🚀 Deploying Zalo OAuth PKCE fix..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin cdhy

# Stop PM2
echo "⏸️ Stopping PM2..."
pm2 stop qlcd-api

# Delete old process
echo "🗑️ Deleting old PM2 process..."
pm2 delete qlcd-api

# Start with single instance
echo "▶️ Starting with single instance..."
pm2 start ecosystem.config.js --only qlcd-api

# Save PM2 config
pm2 save

# Show status
echo "✅ Deployment complete!"
pm2 list

echo ""
echo "📊 Check instances - should show only 1 instance:"
pm2 show qlcd-api | grep "instances"

echo ""
echo "📝 Next steps:"
echo "1. Call GET /api/v1/zalo/auth-url to generate new state"
echo "2. Use the authorization_url from response"
echo "3. After authorization, callback will work correctly"
