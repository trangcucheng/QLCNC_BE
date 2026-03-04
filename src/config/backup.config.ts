// src/config/backup.config.ts
import * as fs from 'fs'; // Import fs module

export const getBackupConfig = () => ({
  backup: {
    type: process.env.TYPEORM_TYPE || 'mysql', // Loại CSDL
    host: process.env.DB_HOST || 'localhost', // Địa chỉ host CSDL
    port: parseInt(process.env.DB_PORT, 10) || 3306, // Cổng kết nối đến CSDL
    database: process.env.DB_NAME || 'PMTS', // Tên CSDL
    username: process.env.DB_USER || 'root', // Tên người dùng CSDL
    password: process.env.DB_PASS || '1', // Mật khẩu CSDL
    cache: true, // Sử dụng cache
    keepConnectionAlive: false, // Giữ kết nối CSDL sống
    logging: false, // Bật ghi log
    synchronize: false, // Đồng bộ hóa tự động các thay đổi cấu trúc CSDL
    ssl: null, // Tùy chọn SSL, nếu có
  },
});
