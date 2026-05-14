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

  // Kiểm tra xem user có phải admin không (role_id = 1)
  const isAdmin = user?.role_id === 1;

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Link to="/" className="logo">
            <h1>Điện Lạnh Store</h1>
          </Link>
          
          <div className="header-actions">
            {/* Giỏ hàng - Chỉ hiện với user thường */}
            {!isAdmin && (
              <Link to="/cart" className="cart-link">
                🛒 Giỏ hàng
                {getTotalItems() > 0 && (
                  <span className="cart-count">{getTotalItems()}</span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="user-menu">
                {isAdmin ? (
                  <>
                    <span className="admin-badge">👨‍💼 Admin</span>
                    <span>{user?.full_name || user?.username}</span>
                  </>
                ) : (
                  <>
                    <span>👤 {user?.full_name || user?.username}</span>
                  </>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu - Phân biệt Admin và User */}
        {isAdmin ? (
          // 🛠️ ADMIN MENU
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-item active">
              ️ Dashboard
            </Link>
            <Link to="/admin?tab=products" className="admin-nav-item">
              📦 Sản phẩm
            </Link>
            <Link to="/admin?tab=orders" className="admin-nav-item">
              📋 Đơn hàng
            </Link>
            <Link to="/" className="admin-nav-item">
              🏠 Xem trang chủ
            </Link>
          </nav>
        ) : (
          // 🛍️ PUBLIC MENU (Cho khách hàng)
          <nav className="main-nav">
            <Link to="/">Trang chủ</Link>
            <Link to="/products">Sản phẩm</Link>
            <Link to="/products?category_id=1">Tủ lạnh</Link>
            <Link to="/products?category_id=2">Máy lạnh</Link>
            <Link to="/products?category_id=3">Máy giặt</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;