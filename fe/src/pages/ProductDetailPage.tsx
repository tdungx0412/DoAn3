import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Product } from '../types';
import { formatPrice } from '../config';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      const response = await productService.getById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="not-found">
          <h2>😕 Không tìm thấy sản phẩm</h2>
          <Link to="/products" className="btn btn-primary">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const discountPrice = product.original_price 
    ? product.original_price - (product.original_price * (product.discount_percent || 0) / 100)
    : product.price;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    }
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> / 
          <Link to="/products"> Sản phẩm</Link> / 
          <span> {product.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-images">
            <img 
              src={product.main_image || 'https://via.placeholder.com/500x500?text=No+Image'} 
              alt={product.name}
              className="main-image"
            />
          </div>

          <div className="product-info-detail">
            <h1>{product.name}</h1>
            
            <div className="product-rating">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="review-count">(0 đánh giá)</span>
            </div>

            <div className="product-price-detail">
              {product.discount_percent && product.discount_percent > 0 ? (
                <>
                  <span className="current-price">{formatPrice(discountPrice)}</span>
                  <span className="original-price">{formatPrice(product.original_price || 0)}</span>
                  <span className="discount-percent">-{product.discount_percent}%</span>
                </>
              ) : (
                <span className="current-price">{formatPrice(product.price)}</span>
              )}
            </div>

            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.short_description || product.description}</p>
            </div>

            <div className="product-specs-detail">
              <h3>Thông số kỹ thuật</h3>
              <table className="specs-table">
                <tbody>
                  {product.capacity && (
                    <tr>
                      <td>Dung tích/Công suất</td>
                      <td>{product.capacity}</td>
                    </tr>
                  )}
                  {product.power_consumption && (
                    <tr>
                      <td>Công suất tiêu thụ</td>
                      <td>{product.power_consumption}</td>
                    </tr>
                  )}
                  {product.energy_rating && (
                    <tr>
                      <td>Nhãn năng lượng</td>
                      <td>{product.energy_rating}</td>
                    </tr>
                  )}
                  {product.dimensions && (
                    <tr>
                      <td>Kích thước</td>
                      <td>{product.dimensions}</td>
                    </tr>
                  )}
                  {product.weight && (
                    <tr>
                      <td>Trọng lượng</td>
                      <td>{product.weight}</td>
                    </tr>
                  )}
                  {product.color && (
                    <tr>
                      <td>Màu sắc</td>
                      <td>{product.color}</td>
                    </tr>
                  )}
                  {product.warranty_months && (
                    <tr>
                      <td>Bảo hành</td>
                      <td>{product.warranty_months} tháng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="product-actions-detail">
              <div className="quantity-selector">
                <label>Số lượng:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    min="1" 
                    max={product.stock_quantity || 99}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="qty-input"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button onClick={handleAddToCart} className="btn btn-primary btn-lg">
                  🛒 Thêm vào giỏ hàng
                </button>
                <button className="btn btn-outline btn-lg">
                  ❤️ Yêu thích
                </button>
              </div>

              {product.stock_quantity && product.stock_quantity < 10 && (
                <div className="stock-warning">
                  ⚠️ Chỉ còn {product.stock_quantity} sản phẩm
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;