# Elasticsearch Installation and Setup Script for CDCS Project

Write-Host "🚀 Starting Elasticsearch setup for CDCS..." -ForegroundColor Green

# Navigate to project directory
Set-Location "f:\DUAN\Quản lý công đoàn cơ sở\Code\CDCS"

# Install dependencies
Write-Host "📦 Installing @nestjs/elasticsearch..." -ForegroundColor Yellow
npm install @nestjs/elasticsearch@^10.0.1

Write-Host "✅ Installation complete!" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure Elasticsearch is running at http://localhost:9200"
Write-Host "2. Update .env file with ELASTICSEARCH_URL=http://localhost:9200"
Write-Host "3. Start the application: npm run start:dev"
Write-Host "4. Sync data: POST /bao-cao-doan-so-theo-ky/syncBaoCao"
Write-Host ""
Write-Host "📚 See ELASTICSEARCH_QUICK_REFERENCE.md for API usage" -ForegroundColor Cyan
