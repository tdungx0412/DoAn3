import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // 2. Kiểm tra mật khẩu (Dùng hàm validatePassword đã sửa ở trên)
    const isValidPassword = await User.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // 3. Tạo token
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    // 4. Trả về kết quả
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const newUser = await User.create({
      username,
      email,
      password, // Lưu mật khẩu thường
      full_name,
      phone,
      role_id: 2
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role_id: newUser.role_id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          full_name: newUser.full_name,
          role_id: newUser.role_id
        }
      },
      message: 'Đăng ký thành công'
    });
  } catch (error: any) {
    console.error('❌ Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};