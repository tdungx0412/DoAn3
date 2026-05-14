import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../config';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    original_price?: number;
    discount_percent?: number;
    main_image?: string | null;
    slug?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const defaultImage = 'https://via.placeholder.com/400x300/0066cc/ffffff?text=San+Pham';

  return (
    <div className="product-card" style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="product-image" style={{
        position: 'relative',
        paddingTop: '75%',
        overflow: 'hidden',
        background: '#f5f5f5'
      }}>
        <Link to={`/products/${product.id}`} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <img 
            src={product.main_image || defaultImage} 
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '10px'
            }}
          />
        </Link>
        {product.discount_percent && product.discount_percent > 0 && (
          <span className="discount-badge" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#ff4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1
          }}>
            -{product.discount_percent}%
          </span>
        )}
      </div>
      
      <div className="product-info" style={{
        padding: '15px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 className="product-name" style={{
          margin: '0 0 10px 0',
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '1.4',
          minHeight: '40px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          <Link to={`/products/${product.id}`} style={{
            color: '#333',
            textDecoration: 'none'
          }}>
            {product.name}
          </Link>
        </h3>
        
        <div className="product-price" style={{ marginTop: 'auto', marginBottom: '10px' }}>
          {product.discount_percent && product.discount_percent > 0 && product.original_price ? (
            <>
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px', marginRight: '8px' }}>
                {formatPrice(product.original_price)}
              </span>
              <span style={{ color: '#ff4444', fontSize: '16px', fontWeight: 'bold' }}>
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span style={{ color: '#ff4444', fontSize: '16px', fontWeight: 'bold' }}>
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        <Link 
          to={`/products/${product.id}`} 
          style={{
            display: 'block',
            padding: '8px 16px',
            border: '2px solid #0066cc',
            color: '#0066cc',
            textAlign: 'center',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600'
          }}
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;