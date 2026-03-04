/**
 * Script lấy Zalo OA Access Token thủ công
 * 
 * Bước 1: Chạy script này: node get-zalo-token.js
 * Bước 2: Mở URL trong browser và authorize
 * Bước 3: Copy code từ URL callback
 * Bước 4: Paste code vào prompt
 * Bước 5: Script sẽ in ra access_token và refresh_token
 */

const crypto = require('crypto');
const axios = require('axios');
const readline = require('readline');

// Config
const APP_ID = '3362418229677906906';
const APP_SECRET = 'UrUD244w5M4Kv6P41S2T';
const REDIRECT_URI = 'https://api.cdhy.com.vn/api/v1/zalo/callback'; // Phải khớp với URI đã đăng ký trong Zalo Developer

// Generate random string
function randomString(length) {
  return crypto.randomBytes(length).toString('base64url').substring(0, length);
}

// Generate code challenge
function generateChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

async function main() {
  console.log('\n🔐 Zalo OA Token Generator (Simple Mode)\n');

  // Step 1: Generate PKCE params
  const state = randomString(32);
  const codeVerifier = randomString(64);
  const codeChallenge = generateChallenge(codeVerifier);

  // Step 2: Show authorization URL
  const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  console.log('📋 STEP 1: Mở URL này trong browser:\n');
  console.log(authUrl);
  console.log('\n');
  console.log('📋 STEP 2: Sau khi authorize, Zalo sẽ redirect về:');
  console.log(`${REDIRECT_URI}?code=XXX&state=${state}`);
  console.log('\n⚠️  Server sẽ báo lỗi "Invalid OAuth state" - BÌNH THƯỜNG!');
  console.log('    Chỉ cần copy CODE từ URL (phần sau ?code= và trước &state)\n');
  console.log(`📋 STEP 3: Sau khi có CODE, gọi API này để lấy token:\n`);
  console.log(`curl -X GET "https://api.cdhy.com.vn/api/v1/zalo/callback?code=<YOUR_CODE>&state=${state}&code_verifier=${codeVerifier}"\n`);
  console.log('Hoặc dùng Postman/Browser để gọi URL trên.');
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  console.log('💡 HOẶC nếu muốn script tự động exchange:\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('📋 STEP 2: Sau khi authorize, paste CODE từ URL callback vào đây: ', async (code) => {
    rl.close();

    if (!code) {
      console.error('❌ Code không được để trống!');
      process.exit(1);
    }

    console.log('\n🔄 Đang exchange code lấy access token...\n');

    try {
      // Step 4: Exchange code for token
      const formData = new URLSearchParams({
        app_id: APP_ID,
        grant_type: 'authorization_code',
        code: code.trim(),
        code_verifier: codeVerifier,
      });

      const response = await axios.post(
        'https://oauth.zaloapp.com/v4/oa/access_token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': APP_SECRET
          }
        }
      );

      const data = response.data;

      if (data.error && data.error !== 0) {
        console.error('❌ Lỗi từ Zalo:', data.error_description || data.error_name);
        console.error('Full response:', JSON.stringify(data, null, 2));
        process.exit(1);
      }

      // Step 5: Show tokens
      console.log('✅ THÀNH CÔNG! Copy các giá trị sau:\n');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('ACCESS_TOKEN:');
      console.log(data.access_token);
      console.log('\n');
      console.log('REFRESH_TOKEN:');
      console.log(data.refresh_token);
      console.log('\n');
      console.log('EXPIRES_IN:', data.expires_in, 'seconds');
      console.log('EXPIRES_AT:', new Date(Date.now() + data.expires_in * 1000).toISOString());
      console.log('\n═══════════════════════════════════════════════════════════\n');

      // Step 6: Show SQL insert
      console.log('📝 Chạy SQL này để lưu vào DB:\n');
      console.log(`INSERT INTO zalo_oa_tokens (oa_id, access_token, refresh_token, expires_in, expires_at, is_active, created_at)
VALUES (
  '1960042257932933538',
  '${data.access_token}',
  '${data.refresh_token}',
  ${data.expires_in},
  DATE_ADD(NOW(), INTERVAL ${data.expires_in} SECOND),
  1,
  NOW()
);`);

      console.log('\nHoặc update vào .env.production:\n');
      console.log(`ZALO_OA_ACCESS_TOKEN=${data.access_token}`);
      console.log(`ZALO_OA_REFRESH_TOKEN=${data.refresh_token}`);

    } catch (error) {
      console.error('❌ Lỗi:', error.response?.data || error.message);
      process.exit(1);
    }
  });
}

main();
