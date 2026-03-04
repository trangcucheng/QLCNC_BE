#!/bin/bash

# Elasticsearch Installation and Setup Script for CDCS Project

echo "🚀 Starting Elasticsearch setup for CDCS..."

# Navigate to project directory
cd "f:\DUAN\Quản lý công đoàn cơ sở\Code\CDCS"

# Install dependencies
echo "📦 Installing @nestjs/elasticsearch..."
npm install @nestjs/elasticsearch@^10.0.1

echo "✅ Installation complete!"

echo ""
echo "📋 Next Steps:"
echo "1. Make sure Elasticsearch is running at http://localhost:9200"
echo "2. Update .env file with ELASTICSEARCH_URL=http://localhost:9200"
echo "3. Start the application: npm run start:dev"
echo "4. Sync data: POST /bao-cao-doan-so-theo-ky/syncBaoCao"
echo ""
echo "📚 See ELASTICSEARCH_QUICK_REFERENCE.md for API usage"
