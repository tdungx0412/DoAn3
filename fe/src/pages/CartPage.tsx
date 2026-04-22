import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../config';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <h2>🛒 Giỏ hàng của bạn</h2>
          <p>Giỏ hàng đang trống</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">🛒 Giỏ hàng của bạn</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-image">
                  <img 
                    src={item.product.main_image || 'https://via.placeholder.com/100x100?text=No+Image'} 
                    alt={item.product.name}
                  />
                </div>

                <div className="cart-item-info">
                  <h3 className="cart-item-name">
                    <Link to={`/products/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  </h3>
                  
                  {item.product.short_description && (
                    <p className="cart-item-desc">{item.product.short_description}</p>
                  )}

                  <div className="cart-item-price">
                    {item.product.discount_percent && item.product.discount_percent > 0 ? (
                      <>
                        <span className="current-price">
                          {formatPrice(
                            item.product.original_price! - 
                            (item.product.original_price! * item.product.discount_percent! / 100)
                          )}
                        </span>
                        <span className="original-price">
                          {formatPrice(item.product.original_price!)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">{formatPrice(item.product.price)}</span>
                    )}
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="btn-remove"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="btn-clear-cart">
              🗑️ Xóa tất cả
            </button>
          </div>

          <div className="cart-summary">
            <h3>Tổng đơn hàng</h3>
            
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>

            <div className="summary-total">
              <span>Tổng cộng:</span>
              <span className="total-price">{formatPrice(getTotalPrice())}</span>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary btn-block btn-lg">
              💳 Thanh toán ngay
            </button>

            <Link to="/products" className="btn btn-outline btn-block">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;