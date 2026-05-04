import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Quản trị viên</h1>
        <button onClick={() => navigate('/')} className="btn btn-outline">🏠 Về trang chủ</button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button 
            className={`admin-menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Quản lý Sản phẩm
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
             Quản lý Đơn hàng
          </button>
        </aside>

        <main className="admin-content">
          {activeTab === 'products' ? <ProductManagement /> : <OrderManagement />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;