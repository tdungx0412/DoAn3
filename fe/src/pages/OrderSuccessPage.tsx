import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'XXXXXX';

  return (
    <div className="container">
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã mua sắm tại Điện Lạnh Store.</p>
        <p>Mã đơn hàng của bạn là: <strong>#{orderId}</strong></p>
        <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
        
        <div className="success-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            🏠 Về trang chủ
          </Link>
          <Link to="/profile" className="btn btn-outline btn-lg">
            📦 Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;