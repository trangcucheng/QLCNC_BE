// Quick debug script để test Zalo notification
const axios = require('axios');

async function testZaloNotification() {
  try {
    console.log('🧪 Testing Zalo notification system...');
    
    // Test endpoint gửi thông báo
    const response = await axios.post('http://localhost:3000/api/bao-cao-doan-so-theo-ky/thong-bao/gui', {
      tieuDe: "🧪 TEST DEBUG ZALO",
      noiDung: `Test thời gian: ${new Date().toLocaleString('vi-VN')}\n\nĐây là test debug để kiểm tra Zalo notification`,
      target: "tat_ca"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('📊 Response data:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ HTTP Error:', error.response.status);
      console.log('📄 Error data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

// Chạy test
testZaloNotification();
