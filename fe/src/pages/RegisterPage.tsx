import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', full_name: '', phone: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form">
          <h2>Đăng ký tài khoản</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input type="text" name="username" className="form-control" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" className="form-control" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Họ tên</label>
              <input type="text" name="full_name" className="form-control" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" name="password" className="form-control" onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>
          <div className="auth-footer">
            <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;