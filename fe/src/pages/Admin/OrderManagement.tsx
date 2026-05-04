import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice } from '../../config';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/admin');
      setOrders(res.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      loadOrders();
    } catch (err) { alert('Lỗi cập nhật'); }
  };

  return (
    <div>
      <h2>📄 Quản lý Đơn hàng</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Mã ĐH</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Cập nhật</th></tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.order_number}</td>
              <td>{order.recipient_name}</td>
              <td>{formatPrice(order.total_amount)}</td>
              <td>{order.status}</td>
              <td>
                <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="form-control">
                  <option value="pending">Chờ duyệt</option>
                  <option value="processing">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManagement;