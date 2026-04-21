import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatPrice } from '../../config';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image">
        <img
          src={product.main_image || 'https://via.placeholder.com/300x300?text=No+Image'}
          alt={product.name}
        />
        {product.discount_percent && product.discount_percent > 0 && (
          <span className="discount-badge">-{product.discount_percent}%</span>
        )}
      </Link>
      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="product-price">
          <span className="current-price">{formatPrice(product.price)}</span>
        </div>
        <div className="product-actions">
          <Link to={`/products/${product.id}`} className="btn btn-outline">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;