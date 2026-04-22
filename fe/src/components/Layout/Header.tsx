import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Link to="/" className="logo"><h1>🔌 Điện Lạnh Store</h1></Link>
          <div className="header-actions">
            <Link to="/cart" className="cart-link">
              🛒 Giỏ hàng
              {getTotalItems() > 0 && (
                <span className="cart-count">{getTotalItems()}</span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="user-menu">
                <span>👤 {user?.full_name || user?.username}</span>
                <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
        <nav className="main-nav">
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Sản phẩm</Link>
          <Link to="/products?category_id=1">Tủ lạnh</Link>
          <Link to="/products?category_id=2">Máy lạnh</Link>
          <Link to="/products?category_id=3">Máy giặt</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;