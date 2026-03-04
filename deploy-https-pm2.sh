#!/bin/bash
set -euo pipefail

echo "🚀 Deploying QLCD API with HTTPS + PM2 for cdhy.com.vn..."
command -v node >/dev/null || { echo "❌ NodeJS chưa cài"; exit 1; }

# Kiểm tra file bắt buộc
[[ -f ecosystem.config.js ]] || { echo "❌ Thiếu ecosystem.config.js"; exit 1; }
[[ -f nginx-qlcd.conf      ]] || { echo "❌ Thiếu nginx-qlcd.conf"; exit 1; }

echo "📦 Installing deps & building..."
npm ci
npm run build

echo "📥 Installing PM2 (if needed)..."
command -v pm2 >/dev/null || npm i -g pm2
mkdir -p logs

echo "⚙️ Installing nginx + certbot..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo ufw allow 80,443/tcp || true

echo "🔧 Temp HTTP config for certificate..."
sudo tee /etc/nginx/sites-available/qlcd >/dev/null <<'EOF'
server {
  listen 80;
  server_name cdhy.com.vn;
  location / { return 200 "temp http ok\n"; }
  location /.well-known/acme-challenge/ { root /var/www/html; }
}
EOF
sudo mkdir -p /var/www/html
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/qlcd /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "🔒 Getting SSL cert..."
sudo certbot --nginx -d cdhy.com.vn --agree-tos -m you@email.com --redirect

echo "🔧 Switching to full HTTPS reverse-proxy config..."
sudo cp nginx-qlcd.conf /etc/nginx/sites-available/qlcd
sudo nginx -t && sudo systemctl reload nginx

echo "🎯 Starting PM2 app..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup -u $USER --hp $HOME

echo "🧹 (Optional) pm2-logrotate..."
pm2 install pm2-logrotate || true
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

echo "✅ Done. Visit https://cdhy.com.vn"
