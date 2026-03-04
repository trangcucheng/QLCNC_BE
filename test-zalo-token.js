const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testZaloOAToken() {
  console.log('🚀 Testing Zalo OA Token Service...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const zaloTokenService = app.get('ZaloOASimpleTokenService');
  
  try {
    // Test 1: Kiểm tra bảng đã tồn tại
    console.log('1. Testing table creation...');
    await zaloTokenService.createTableIfNotExists();
    console.log('✅ Table check passed');

    // Test 2: Lấy token hiện tại (nếu có)
    console.log('2. Getting current token...');
    const currentToken = await zaloTokenService.getCurrentToken();
    console.log('Current token:', currentToken ? 'Found' : 'Not found');

    // Test 3: Lấy access token
    console.log('3. Getting access token...');
    const accessToken = await zaloTokenService.getAccessToken();
    console.log('Access token:', accessToken ? 'Available' : 'Not available');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

testZaloOAToken();
