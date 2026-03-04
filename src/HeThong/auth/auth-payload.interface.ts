//import { Role } from 'src/databases/entities/roles.entity';
//mở ra khi có phân quyền
export interface AuthPayload {
  id: number | string;
  userName?: string;
  identity: string;
  passWord?: string;
  role?: string;
  permissions?: any; // ✅ Thêm permissions vào JWT payload
}
