import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZaloUserService {
  async getZaloUserInfoZalo(followerId: string, accessToken: string) {
    const url = 'https://openapi.zalo.me/v2.0/oa/getprofile';

    // Tạo data payload theo format yêu cầu của Zalo API
    const data = JSON.stringify({ user_id: followerId });

    const response = await axios.get(url, {
      params: { data },
      headers: { access_token: accessToken },
    });

    console.log('🔍 Zalo User Info Response:', JSON.stringify(response.data, null, 2));

    // Trả về dữ liệu đã format để lưu vào zalo_accounts
    if (response.data && response.data.error === 0 && response.data.data) {
      const userData = response.data.data;
      return {
        success: true,
        data: {
          zaloOaUserId: userData.user_id,
          zaloAppUserId: userData.user_id_by_app,
          displayName: userData.display_name,
          avatar: userData.avatar || userData.avatars?.['120'] || null,
          userGender: userData.user_gender,
          birthDate: userData.birth_date,
          isSensitive: userData.is_sensitive,
          tagsAndNotes: userData.tags_and_notes_info,
          rawData: userData // Lưu raw data để debug
        }
      };
    } else {
      return {
        success: false,
        error: response.data?.message || 'Unknown error',
        rawResponse: response.data
      };
    }
  }
}
