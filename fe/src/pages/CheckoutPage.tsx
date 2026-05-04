import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { formatPrice } from '../config';

const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    recipient_name: user?.full_name || '',
    recipient_phone: user?.phone || '',
    shipping_address: '',
    customer_note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items,
        total_amount: getTotalPrice(),
        ...formData
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        clearCart(); // Xóa giỏ hàng sau khi đặt thành công
        navigate('/order-success', { state: { orderId: response.data.orderId, orderNumber: response.data.order_number } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title"> Thông tin giao hàng</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="checkout-layout">
          {/* Form thông tin */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label>Họ và tên người nhận *</label>
              <input type="text" name="recipient_name" value={formData.recipient_name} onChange={handleChange} required className="form-control" />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input type="tel" name="recipient_phone" value={formData.recipient_phone} onChange={handleChange} required className="form-control" />
            </div>

            <div className="form-group">
              <label>Địa chỉ giao hàng *</label>
              <textarea name="shipping_address" value={formData.shipping_address} onChange={handleChange} required rows={3} className="form-control" placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
            </div>

            <div className="form-group">
              <label>Ghi chú đơn hàng</label>
              <textarea name="customer_note" value={formData.customer_note} onChange={handleChange} rows={2} className="form-control" placeholder="VD: Giao giờ hành chính, để trước cửa..." />
            </div>

            <div className="checkout-actions">
              <button type="button" onClick={() => navigate('/cart')} className="btn btn-outline">← Quay lại giỏ hàng</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Đang xử lý...' : `Xác nhận đặt hàng (${formatPrice(getTotalPrice())})`}
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
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>Miễn phí</span>
            </div>
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