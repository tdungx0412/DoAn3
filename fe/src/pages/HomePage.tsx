import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/Product/ProductCard';
import { Product } from '../types';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAll();
      if (response.success && response.data) {
        // Lấy 8 sản phẩm đầu tiên
        setProducts(response.data.slice(0, 8));
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Banner */}
      <section className="hero-banner">
        <div className="container">
          <div className="banner-content">
            <h1>Thiết Bị Điện Lạnh Chính Hãng</h1>
            <p>Giảm giá đến 30% cho tất cả sản phẩm mùa hè này</p>
            <Link to="/products" className="btn btn-primary btn-lg">Mua sắm ngay</Link>
          </div>
        </div>
      </section>

      {/* Danh sách sản phẩm */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          
          {loading ? (
            <p style={{textAlign: 'center'}}>Đang tải...</p>
          ) : (
            <div className="product-grid">
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p>Chưa có sản phẩm nào.</p>
              )}
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/products" className="btn btn-outline">Xem tất cả</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;