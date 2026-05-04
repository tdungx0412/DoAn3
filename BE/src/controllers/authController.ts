import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, full_name, phone } = req.body;
      
      console.log('📝 Register attempt:', { username, email });

      // Validate
      if (!username || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
        });
      }

      // Check email exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email đã được sử dụng' 
        });
      }

      // Create user
      const user = await UserModel.create({ 
        username, 
        email, 
        password,
        full_name, 
        phone 
      });

      console.log('✅ User created:', user.id);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role_id === 1 ? 'admin' : 'customer' }, 
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({ 
        success: true, 
        data: { user: userWithoutPassword, token }, 
        message: 'Đăng ký thành công' 
      });
    } catch (error: any) {
      console.error('❌ Register error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi server: ' + error.message 
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login attempt:', email);

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vui lòng nhập email và mật khẩu' 
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email hoặc mật khẩu không đúng' 
        });
      }

      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email hoặc mật khẩu không đúng' 
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role_id === 1 ? 'admin' : 'customer' }, 
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log('✅ Login successful:', user.id);

      res.json({ 
        success: true, 
        data: { user: userWithoutPassword, token }, 
        message: 'Đăng nhập thành công' 
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi server: ' + error.message 
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      const userProfile = await UserModel.findById(user.id);
      if (!userProfile) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy người dùng' 
        });
      }

      res.json({ success: true, data: userProfile });
    } catch (error: any) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi server: ' + error.message 
      });
    }
  }
}