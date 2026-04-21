import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import jwt from 'jsonwebtoken';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, full_name, phone } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const user = await UserModel.create({ username, email, password, full_name, phone });
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role_id === 1 ? 'admin' : 'customer' }, 
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      // ✅ CÁCH 1: Tạo object mới không có password
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role_id: user.role_id,
        created_at: user.created_at
      };

      res.status(201).json({ 
        success: true, 
        data: { user: userResponse, token }, 
        message: 'Registration successful' 
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role_id === 1 ? 'admin' : 'customer' }, 
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      // ✅ CÁCH 1: Tạo object mới không có password
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role_id: user.role_id,
        created_at: user.created_at
      };

      res.json({ 
        success: true, 
        data: { user: userResponse, token }, 
        message: 'Login successful' 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true,  user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}