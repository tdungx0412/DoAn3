import sql from 'mssql';
import { getPool } from '../config/database';

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role_id?: number;
}

export class User {
  // Tìm user theo email
  static async findByEmail(email: string): Promise<IUser | undefined> {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    return result.recordset[0];
  }

  // Tìm user theo ID
  static async findById(id: number): Promise<IUser | undefined> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id = @id');
    return result.recordset[0];
  }

  // Tạo user mới (lưu mật khẩu thường)
  static async create(userData: Partial<IUser> & { password: string }): Promise<IUser> {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('username', sql.NVarChar, userData.username)
      .input('email', sql.NVarChar, userData.email)
      .input('password', sql.NVarChar, userData.password) // Lưu thẳng mật khẩu thường
      .input('full_name', sql.NVarChar, userData.full_name || '')
      .input('phone', sql.NVarChar, userData.phone || '')
      .input('role_id', sql.Int, userData.role_id || 2)
      .query(`
        INSERT INTO users (username, email, password, full_name, phone, role_id)
        OUTPUT INSERTED.*
        VALUES (@username, @email, @password, @full_name, @phone, @role_id)
      `);

    return result.recordset[0];
  }

  // ✅ Kiểm tra mật khẩu: SO SÁNH TRỰC TIẾP (Không dùng bcrypt)
  static async validatePassword(user: IUser, password: string): Promise<boolean> {
    return password === user.password;
  }
}