import sql from 'mssql';
import bcrypt from 'bcrypt';
import pool from '../config/database';

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string; 
  full_name?: string;
  phone?: string;
  role_id?: number;
  created_at?: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<IUser | null> {
    const conn = await pool;
    const result = await conn.request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT * FROM users WHERE email = @email`);
    return result.recordset[0] || null;
  }

  static async findById(id: number): Promise<any | null> {
    const conn = await pool;
    const result = await conn.request()
      .input('id', sql.Int, id)
      .query(`SELECT id, username, email, full_name, phone, role_id, status, created_at FROM users WHERE id = @id`);
    return result.recordset[0] || null;
  }

  static async create(user: IUser): Promise<any> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const conn = await pool;
    
    const result = await conn.request()
      .input('username', sql.NVarChar, user.username)
      .input('email', sql.NVarChar, user.email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('full_name', sql.NVarChar, user.full_name || null)
      .input('phone', sql.NVarChar, user.phone || null)
      .input('role_id', sql.Int, user.role_id || 2)
      .query(`
        INSERT INTO users (username, email, password, full_name, phone, role_id)
        VALUES (@username, @email, @password, @full_name, @phone, @role_id)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.full_name, INSERTED.phone, INSERTED.role_id, INSERTED.created_at
      `);
    return result.recordset[0];
  }

  static async validatePassword(user: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
}