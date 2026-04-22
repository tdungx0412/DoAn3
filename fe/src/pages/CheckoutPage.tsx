import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { formatPrice } from '../config';

const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    recipient_name: user?.full_name || '',
    recipient_phone: user?.phone || '',
    shipping_address: '',
  });
  const [loading, setLoading] = useState(false);

  // Nếu chưa đăng nhập hoặc giỏ hàng trống, chuyển hướng
  React.useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (items.length === 0) navigate('/cart');
  }, [isAuthenticated, items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items,
        total_amount: getTotalPrice(),
        ...formData
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
        navigate('/order-success', { state: { orderId: response.data.orderId } });
      }
    } catch (error) {
      alert('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">📦 Thông tin giao hàng</h1>

        <div className="checkout-layout">
          {/* Form thông tin */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label>Họ và tên người nhận *</label>
              <input 
                type="text" 
                name="recipient_name" 
                value={formData.recipient_name} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input 
                type="tel" 
                name="recipient_phone" 
                value={formData.recipient_phone} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ giao hàng *</label>
              <textarea 
                name="shipping_address" 
                value={formData.shipping_address} 
                onChange={handleChange} 
                required 
                rows={3}
                className="form-control"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              />
            </div>

            <div className="checkout-actions">
              <button 
                type="button" 
                onClick={() => navigate('/cart')} 
                className="btn btn-outline"
              >
                ← Quay lại giỏ hàng
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : `Đặt hàng (${formatPrice(getTotalPrice())})`}
              </button>
            </div>
          </form>

          {/* Tóm tắt đơn hàng */}
          <div className="order-summary">
            <h3>Đơn hàng của bạn</h3>
            {items.map(item => (
              <div key={item.product.id} className="summary-item">
                <span className="item-name">{item.product.name} (x{item.quantity})</span>
                <span className="item-price">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Tổng cộng:</span>
              <span className="total-price">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;