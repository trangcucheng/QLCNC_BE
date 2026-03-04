/**
 * test-zalo-oa-notification.js
 * Test gửi thông báo phê duyệt báo cáo qua Zalo OA
 */

const axios = require('axios');

async function testZaloOANotification() {
  console.log('🚀 Testing Zalo OA Notification System...');

  try {
    // Test gọi API backend để gửi thông báo
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
    const TEST_ZALO_USER_ID = '2434694422809794199'; // User ID test

    // Mock data phê duyệt báo cáo
    const approvalData = {
      zaloUserId: TEST_ZALO_USER_ID,
      reportId: 123,
      reportType: 'Báo cáo đoàn số theo kỳ',
      status: 'approved' // hoặc 'rejected'
    };

    console.log('📋 Testing approval notification...');
    console.log('Data:', approvalData);

    // Nếu có JWT token, thêm vào header
    const headers = {
      'Content-Type': 'application/json'
    };

    // Gọi endpoint test (cần tạo endpoint này)
    const response = await axios.post(`${API_BASE_URL}/auth/zalo/test-approval-notification`, approvalData, { headers });

    console.log('✅ Response:', response.data);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testZaloOANotification();
