# Checklist Domain Change Impact Assessment

## 📍 Current Domain Configuration Analysis

### Current Domain: `cdhy.com.vn`

## 🎯 Files Need to Update When Changing Domain:

### 1. Environment Variables (.env)
```bash
ZALO_WEBHOOK_URL=https://cdhy.com.vn/webhook/zalo
```
**Impact:** 🔴 HIGH - Zalo webhooks sẽ thất bại

### 2. HTTPS/SSL Configuration Files

#### nginx-qlcd.conf
```nginx
server_name cdhy.com.vn;
ssl_certificate /etc/letsencrypt/live/cdhy.com.vn/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/cdhy.com.vn/privkey.pem;
```
**Impact:** 🔴 HIGH - SSL sẽ không hoạt động

#### src/main.https.ts  
```typescript
'https://cdhy.com.vn',  // CORS origin
```
**Impact:** 🟡 MEDIUM - CORS lỗi từ frontend

#### deploy-https-pm2.sh
```bash
server_name cdhy.com.vn;
sudo certbot --nginx -d cdhy.com.vn
```
**Impact:** 🟡 MEDIUM - Auto-deployment script

### 3. Code References

#### src/report/zalo-report.controller.ts
```typescript
webUrl: 'https://your-domain.com/report/export-bao-cao-cdcs',
```
**Impact:** 🟢 LOW - Hardcoded placeholder URL

## 🛠️ Step-by-Step Migration Plan

### Phase 1: SSL Certificate Preparation
1. **Generate new SSL cert for new domain:**
   ```bash
   sudo certbot certonly --nginx -d new-domain.com
   ```

2. **Backup current cert:**
   ```bash
   sudo cp -r /etc/letsencrypt/live/cdhy.com.vn/ /backup/
   ```

### Phase 2: Configuration Updates
1. **Update .env file:**
   ```bash
   # OLD
   ZALO_WEBHOOK_URL=https://cdhy.com.vn/webhook/zalo
   
   # NEW
   ZALO_WEBHOOK_URL=https://new-domain.com/webhook/zalo
   ```

2. **Update nginx config:**
   ```bash
   # Update nginx-qlcd.conf
   sed -i 's/cdhy.com.vn/new-domain.com/g' nginx-qlcd.conf
   ```

3. **Update main.https.ts:**
   ```typescript
   // OLD
   'https://cdhy.com.vn',
   
   // NEW  
   'https://new-domain.com',
   ```

4. **Update deployment script:**
   ```bash
   sed -i 's/cdhy.com.vn/new-domain.com/g' deploy-https-pm2.sh
   ```

### Phase 3: External Services Update

#### Zalo Webhook Configuration
```
1. Vào https://oa.zalo.me/manage
2. Settings → API & Webhook
3. Update Webhook URL:
   OLD: https://cdhy.com.vn/webhook/zalo
   NEW: https://new-domain.com/webhook/zalo
4. Save & Test webhook
```

#### DNS Configuration  
```
1. Update A record: new-domain.com → server IP
2. Update CNAME (nếu có): www.new-domain.com → new-domain.com
3. Wait for DNS propagation (5-30 minutes)
```

### Phase 4: Testing & Validation

#### SSL Certificate Test
```bash
# Test SSL
openssl s_client -connect new-domain.com:443 -servername new-domain.com

# Test with curl
curl -I https://new-domain.com/api/health
```

#### API Endpoint Test
```bash
# Test main API
curl https://new-domain.com/api/auth/debug/oa-config

# Test Zalo webhook
curl -X POST https://new-domain.com/webhook/zalo \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

#### Application Test
```bash
# Restart services
sudo nginx -t && sudo systemctl reload nginx
npm run build && pm2 restart ecosystem.config.js

# Monitor logs
pm2 logs
tail -f /var/log/nginx/error.log
```

## ⚠️ Critical Migration Risks

### 🔴 High Risk
- **SSL Certificate:** New domain needs new cert
- **Zalo Webhooks:** Must update in OA dashboard
- **CORS Issues:** Frontend may be blocked

### 🟡 Medium Risk  
- **DNS Propagation:** 5-30 minutes downtime
- **Search Engine:** SEO impact if indexed
- **Cached URLs:** Client apps may cache old domain

### 🟢 Low Risk
- **Internal APIs:** Most use relative paths
- **Database:** Domain not stored in DB
- **Authentication:** JWT tokens domain-agnostic

## 📋 Pre-Migration Checklist

### Before Starting:
- [ ] Backup current SSL certificates
- [ ] Backup nginx configuration
- [ ] Test new domain DNS resolution
- [ ] Prepare new SSL certificate
- [ ] Notify users of maintenance window

### During Migration:
- [ ] Update .env file
- [ ] Update nginx config
- [ ] Update CORS origins
- [ ] Generate new SSL cert
- [ ] Update Zalo webhook URL
- [ ] Restart services

### After Migration:
- [ ] Test all API endpoints
- [ ] Test Zalo webhook delivery
- [ ] Test SSL certificate
- [ ] Monitor error logs
- [ ] Update documentation

## 🚀 Quick Migration Script

```bash
#!/bin/bash
OLD_DOMAIN="cdhy.com.vn"
NEW_DOMAIN="$1"

if [ -z "$NEW_DOMAIN" ]; then
  echo "Usage: ./migrate-domain.sh new-domain.com"
  exit 1
fi

echo "🔄 Migrating from $OLD_DOMAIN to $NEW_DOMAIN..."

# 1. Update config files
sed -i "s/$OLD_DOMAIN/$NEW_DOMAIN/g" .env
sed -i "s/$OLD_DOMAIN/$NEW_DOMAIN/g" nginx-qlcd.conf
sed -i "s/$OLD_DOMAIN/$NEW_DOMAIN/g" src/main.https.ts
sed -i "s/$OLD_DOMAIN/$NEW_DOMAIN/g" deploy-https-pm2.sh

# 2. Generate new SSL cert
sudo certbot certonly --nginx -d $NEW_DOMAIN --agree-tos --non-interactive

# 3. Test nginx config
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx

# 5. Restart app
npm run build
pm2 restart ecosystem.config.js

echo "✅ Migration completed!"
echo "🔗 New URL: https://$NEW_DOMAIN"
echo "📝 Don't forget to update Zalo webhook URL manually!"
```

## 📞 Emergency Rollback Plan

```bash
#!/bin/bash
# Rollback script
OLD_DOMAIN="cdhy.com.vn"
NEW_DOMAIN="$1"

# Restore config files
git checkout -- .env nginx-qlcd.conf src/main.https.ts deploy-https-pm2.sh

# Restore nginx
sudo systemctl reload nginx

# Restart app
pm2 restart ecosystem.config.js

echo "🔙 Rollback completed to $OLD_DOMAIN"
```
