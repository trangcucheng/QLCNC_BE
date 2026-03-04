# 🚀 HTTPS Setup cho Zalo Mini App Development

## 📋 **Các phương án:**

### **1. Localhost với ngrok (Recommended cho Dev):**
```bash
# Cài ngrok
npm install -g ngrok

# Chạy NestJS server
npm run start:dev

# Tạo HTTPS tunnel
ngrok http 3000

# Sử dụng URL từ ngrok: https://abc123.ngrok.io
```

### **2. SSL Certificate cho Development:**
```bash
# Tạo self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Chạy NestJS với HTTPS
npm run start:dev --https --key key.pem --cert cert.pem
```

### **3. Docker với SSL:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 443
CMD ["npm", "run", "start:prod"]
```

## 🛠 **NestJS HTTPS Configuration:**

### **main.ts với HTTPS:**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS cho Zalo Mini App
  app.enableCors({
    origin: ['https://mini.zalo.me', 'https://localhost:3000'],
    credentials: true,
  });

  // HTTPS options
  const httpsOptions = {
    key: fs.readFileSync('./secrets/key.pem'),
    cert: fs.readFileSync('./secrets/cert.pem'),
  };

  await app.listen(443, () => {
    console.log('Server running on https://localhost:443');
  });
}
bootstrap();
```

## 🌐 **Production Deployment:**

### **1. Cloud Services với SSL:**
- **Heroku**: Tự động HTTPS
- **Vercel**: Tự động SSL certificate  
- **AWS/DigitalOcean**: Cấu hình Load Balancer với SSL
- **Nginx**: Reverse proxy với Let's Encrypt

### **2. Let's Encrypt (Free SSL):**
```bash
# Cài Certbot
sudo apt install certbot

# Lấy certificate
sudo certbot certonly --standalone -d your-domain.com

# Nginx config
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## 📱 **Zalo Mini App Configuration:**

### **app.json:**
```json
{
  "app": {
    "appName": "Công đoàn cơ sở",
    "appId": "your-zalo-app-id"
  },
  "api": {
    "baseURL": "https://your-secure-domain.com/api"
  },
  "pages": [
    "pages/index/index",
    "pages/events/events"  
  ]
}
```

### **API Calls trong Zalo Mini App:**
```javascript
// Tất cả API calls phải HTTPS
zalo.request({
  url: 'https://your-domain.com/api/mobile/su-kien/list',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  success: function(res) {
    console.log('API response:', res);
  }
});
```

## ⚠️ **Lưu ý quan trọng:**

### **Development:**
- Có thể dùng HTTP với localhost
- Sử dụng ngrok để tạo HTTPS tunnel
- Test trên Zalo Developer Tools

### **Production:**
- **BẮT BUỘC HTTPS**
- Domain phải có SSL certificate hợp lệ
- Cấu hình CORS cho Zalo domains

### **Zalo Platform Requirements:**
- API endpoints: HTTPS only
- Webhook URLs: HTTPS only  
- OAuth redirect: HTTPS only
- File uploads: HTTPS only

## 🔧 **Quick Setup Script:**
```bash
#!/bin/bash
# setup-https-dev.sh

echo "Setting up HTTPS for Zalo Mini App development..."

# Install ngrok if not exists
if ! command -v ngrok &> /dev/null; then
    npm install -g ngrok
fi

# Start NestJS in background
npm run start:dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Start ngrok tunnel
echo "Starting HTTPS tunnel..."
ngrok http 3000 &
NGROK_PID=$!

echo "✅ Setup complete!"
echo "🔗 Check ngrok dashboard at: http://localhost:4040"
echo "🚀 Your HTTPS URL will be displayed above"
echo "📱 Use that HTTPS URL in your Zalo Mini App"

# Cleanup on exit
trap "kill $SERVER_PID $NGROK_PID" EXIT
wait
```

**💡 Khuyến nghị: Sử dụng ngrok cho development và cloud services có SSL cho production!**
