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

    console.log('📤 Gửi đơn hàng:', { items, formData });

    try {
      const orderData = {
        items,
        shipping_address: formData.shipping_address,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        customer_note: formData.customer_note
      };

      const response = await orderService.createOrder(orderData);
      
      console.log('✅ Phản hồi từ server:', response);
      
      if (response.success) {
        clearCart(); // Xóa giỏ hàng
        navigate('/order-success', { 
          state: { 
            orderId: response.data.orderId, 
            orderNumber: response.data.order_number 
          } 
        });
      }
    } catch (err: any) {
      console.error('❌ Lỗi đặt hàng:', err);
      const errorMsg = err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
      setError(errorMsg);
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
        <h1 className="page-title">📦 Thông tin giao hàng</h1>

        {error && (
          <div className="alert alert-error" style={{
            padding: '15px', background: '#ffebee', color: '#c62828',
            borderRadius: '8px', marginBottom: '20px', border: '1px solid #ef9a9a'
          }}>
            ❌ {error}
          </div>
        )}

        <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
          
          {/* Form thông tin */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Họ và tên *</label>
              <input type="text" name="recipient_name" value={formData.recipient_name} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Số điện thoại *</label>
              <input type="tel" name="recipient_phone" value={formData.recipient_phone} onChange={handleChange} required className="form-control" />
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Địa chỉ giao hàng *</label>
              <textarea name="shipping_address" value={formData.shipping_address} onChange={handleChange} required rows={3} className="form-control" />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Ghi chú</label>
              <textarea name="customer_note" value={formData.customer_note} onChange={handleChange} rows={2} className="form-control" />
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => navigate('/cart')} className="btn btn-outline">← Quay lại</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? '⏳ Đang xử lý...' : `✅ Xác nhận (${formatPrice(getTotalPrice())})`}
              </button>
            </div>
          </form>

          {/* Tóm tắt đơn hàng */}
          <div className="order-summary" style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0 }}>Đơn hàng của bạn</h3>
            {items.map(item => (
              <div key={item.product.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '14px' }}>{item.product.name} (x{item.quantity})</div>
                <div style={{ fontSize: '14px', color: '#ff4444', fontWeight: 600 }}>{formatPrice(item.product.price * item.quantity)}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #0066cc', marginTop: '10px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tổng cộng:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4444' }}>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;