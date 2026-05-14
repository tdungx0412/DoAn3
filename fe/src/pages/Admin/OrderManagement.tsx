import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice } from '../../config';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      alert('Đã cập nhật trạng thái!');
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>⏳ Đang tải...</div>;

  return (
    <div style={{padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh'}}>
      <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937'}}>
        📦 Quản lý Đơn hàng
      </h2>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        overflowX: 'auto'
      }}>
        <table style={{
          minWidth: '1200px',
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead style={{backgroundColor: '#f3f4f6'}}>
            <tr>
              {['Mã Đơn', 'Khách Hàng', 'Địa chỉ & SĐT', 'Tổng Tiền', 'Trạng thái', 'Ngày tạo', 'Hành động'].map((header) => (
                <th key={header} style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{backgroundColor: 'white'}}>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{padding: '40px', textAlign: 'center', color: '#6b7280'}}>
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr 
                  key={order.id} 
                  style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb')}
                >
                  <td style={{padding: '20px 24px', fontSize: '14px', fontWeight: 'bold', color: '#111827', whiteSpace: 'nowrap'}}>
                    #{order.order_number}
                  </td>
                  <td style={{padding: '20px 24px', whiteSpace: 'nowrap'}}>
                    <div style={{fontSize: '14px', fontWeight: '500', color: '#111827'}}>{order.recipient_name}</div>
                    <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>(TK: {order.account_name || 'Guest'})</div>
                  </td>
                  <td style={{padding: '20px 24px'}}>
                    <div style={{fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px'}}>
                      📞 {order.recipient_phone}
                    </div>
                    <div style={{fontSize: '12px', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {order.shipping_address}
                    </div>
                  </td>
                  <td style={{padding: '20px 24px', fontSize: '14px', fontWeight: 'bold', color: '#dc2626', whiteSpace: 'nowrap'}}>
                    {formatPrice(order.total_amount)}
                  </td>
                  <td style={{padding: '20px 24px', whiteSpace: 'nowrap'}}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      borderRadius: '9999px',
                      border: '1px solid',
                      ...(order.status === 'pending' ? {backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fcd34d'} : {}),
                      ...(order.status === 'processing' ? {backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd'} : {}),
                      ...(order.status === 'delivered' ? {backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7'} : {}),
                      ...(order.status === 'cancelled' ? {backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5'} : {})
                    }}>
                      {order.status === 'pending' ? '⏳ Chờ xử lý' : 
                       order.status === 'processing' ? '🚚 Đang giao' : 
                       order.status === 'delivered' ? '✅ Đã giao' : '❌ Hủy'}
                    </span>
                  </td>
                  <td style={{padding: '20px 24px', fontSize: '14px', color: '#4b5563', whiteSpace: 'nowrap'}}>
                    <div style={{fontWeight: '500'}}>{new Date(order.created_at).toLocaleDateString('vi-VN')}</div>
                    <div style={{fontSize: '12px', color: '#9ca3af', marginTop: '4px'}}>{new Date(order.created_at).toLocaleTimeString('vi-VN')}</div>
                  </td>
                  <td style={{padding: '20px 24px', whiteSpace: 'nowrap'}}>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="processing">Đang giao</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Hủy</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;