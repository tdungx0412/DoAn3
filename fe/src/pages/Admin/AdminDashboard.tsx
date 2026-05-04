import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';

const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Quản trị viên</h1>
        <button onClick={() => window.location.href = '/'} className="btn btn-outline">
          🏠 Về trang chủ
        </button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button 
            className={`admin-menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: 'products' })}
          >
            📦 Quản lý Sản phẩm
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setSearchParams({ tab: 'orders' })}
          >
            📋 Quản lý Đơn hàng
          </button>
        </aside>

        <main className="admin-content">
          {activeTab === 'orders' ? <OrderManagement /> : <ProductManagement />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;