import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      
      //Lấy thông tin user vừa đăng nhập 
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      //Phân quyền điều hướng
      if (currentUser?.role_id === 1) {
        // 
        navigate('/admin');
      } else {
        // 
        navigate('/');
      }
      
      // Reload để cập nhật trạng thái header
      window.location.reload();

    } catch (err: any) {
      const message = err.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form">
          <h2>Đăng nhập</h2>
          
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
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
              <label>Mật khẩu</label>
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

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;