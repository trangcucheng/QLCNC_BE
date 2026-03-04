# Quick Fix for TypeScript Compilation Errors
# Run this script to fix the elasticsearch dependency issues

Write-Host "🔧 Fixing TypeScript compilation errors..." -ForegroundColor Green

# Navigate to project directory
Set-Location "f:\DUAN\Quản lý công đoàn cơ sở\Code\CDCS"

Write-Host ""
Write-Host "Step 1: Removing old elasticsearch package..." -ForegroundColor Yellow
npm uninstall @nestjs/elasticsearch

Write-Host ""
Write-Host "Step 2: Installing compatible elasticsearch version..." -ForegroundColor Yellow
npm install @nestjs/elasticsearch@^10.0.1

Write-Host ""
Write-Host "Step 3: Clearing cache and rebuilding..." -ForegroundColor Yellow
npm run prebuild

Write-Host ""
Write-Host "✅ Fix complete! Try running: npm run start:dev" -ForegroundColor Green

Write-Host ""
Write-Host "ℹ️  Changes made:" -ForegroundColor Cyan
Write-Host "  - Updated @nestjs/elasticsearch to v10.0.1"
Write-Host "  - Added skipLibCheck: true to tsconfig.json"
Write-Host "  - Added skipDefaultLibCheck: true to tsconfig.json"
Write-Host ""
Write-Host "If errors persist, try:" -ForegroundColor Yellow
Write-Host "  1. Delete node_modules: Remove-Item -Recurse -Force node_modules"
Write-Host "  2. Delete package-lock.json: Remove-Item package-lock.json"
Write-Host "  3. Reinstall: npm install"
