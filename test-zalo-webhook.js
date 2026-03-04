/**
 * test-zalo-webhook.js
 * Test Zalo OA Webhook functionality
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testWebhookEvents() {
  console.log('🚀 Testing Zalo OA Webhook Events...');

  try {
    // Test 1: Follow Event
    console.log('\n1. Testing FOLLOW event...');
    const followEvent = {
      event_name: 'follow',
      follower: {
        id: 'test_user_123',
        name: 'Nguyễn Test User',
        avatar: 'https://example.com/avatar.jpg'
      }
    };

    const followResponse = await axios.post(`${API_BASE_URL}/zalo/test-webhook`, followEvent);
    console.log('✅ Follow Event Response:', followResponse.data.processed);

    // Test 2: Message Event
    console.log('\n2. Testing MESSAGE event...');
    const messageEvent = {
      event_name: 'user_send_text',
      user_id: 'test_user_123',
      message: {
        text: 'Xin chào, tôi muốn biết thông tin'
      }
    };

    const messageResponse = await axios.post(`${API_BASE_URL}/zalo/test-webhook`, messageEvent);
    console.log('✅ Message Event Response:', messageResponse.data.processed);

    // Test 3: Unfollow Event
    console.log('\n3. Testing UNFOLLOW event...');
    const unfollowEvent = {
      event_name: 'unfollow',
      user_id: 'test_user_123'
    };

    const unfollowResponse = await axios.post(`${API_BASE_URL}/zalo/test-webhook`, unfollowEvent);
    console.log('✅ Unfollow Event Response:', unfollowResponse.data.processed);

    // Test 4: Get Stats
    console.log('\n4. Getting ZaloAccount stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/zalo/accounts/stats`);
    console.log('✅ Stats:', JSON.stringify(statsResponse.data.data, null, 2));

    console.log('\n🎉 All webhook tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Chạy test
testWebhookEvents();
