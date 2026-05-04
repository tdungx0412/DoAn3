import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone
      });
      
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng ký thất bại';
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form">
          <h2>Đăng ký tài khoản</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên đăng nhập *</label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
                className="form-control" 
                placeholder="nguyenvana"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="form-control" 
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                name="full_name" 
                value={formData.full_name} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="form-control" 
                placeholder="0901234567"
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu *</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="form-control" 
                placeholder="••••••"
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu *</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                className="form-control" 
                placeholder="••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;