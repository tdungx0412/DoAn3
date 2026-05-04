import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/Product/ProductCard';
import { Product } from '../types';
import { formatPrice, CATEGORIES } from '../config';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Lấy giá trị trực tiếp từ URL (Single Source of Truth)
  const currentPage = parseInt(searchParams.get('page') || '1');
  const keyword = searchParams.get('keyword') || '';
  const category_id = searchParams.get('category_id') || '';
  const min_price = searchParams.get('min_price') || '';
  const max_price = searchParams.get('max_price') || '';
  const sort = searchParams.get('sort') || 'newest';

  const productsPerPage = 12;

  // Load data mỗi khi URL thay đổi
  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { 
        status: 'active',
        page: currentPage,
        limit: productsPerPage
      };
      
      if (keyword) params.keyword = keyword;
      if (category_id) params.category_id = category_id;
      if (min_price) params.min_price = min_price;
      if (max_price) params.max_price = max_price;
      if (sort) params.sort = sort;

      const response = await productService.getAll(params);
      
      if (response.success) {
        setProducts(response.data || []);
        setTotalProducts(response.total || 0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật URL (tự động reset về trang 1 khi đổi filter)
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset page khi thay đổi điều kiện lọc
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hàm chuyển trang riêng
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>Tất cả sản phẩm</h1>
          <p>Tìm thấy {totalProducts} sản phẩm</p>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>🔍 Tìm kiếm</h3>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={keyword}
                onChange={(e) => updateParams('keyword', e.target.value)}
                className="form-control"
              />
            </div>

            <div className="filter-section">
              <h3>📂 Danh mục</h3>
              <div className="category-list">
                <label className={`category-item ${!category_id ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={!category_id}
                    onChange={() => updateParams('category_id', '')}
                  />
                  <span>Tất cả</span>
                </label>
                {CATEGORIES.map(cat => (
                  <label key={cat.id} className={`category-item ${category_id === cat.id.toString() ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      checked={category_id === cat.id.toString()}
                      onChange={() => updateParams('category_id', cat.id.toString())}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>💰 Khoảng giá</h3>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Từ"
                  value={min_price}
                  onChange={(e) => updateParams('min_price', e.target.value)}
                  className="form-control"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={max_price}
                  onChange={(e) => updateParams('max_price', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="price-quick-filters">
                <button onClick={() => updateParams('max_price', '5000000')} className="btn-quick">Dưới 5 triệu</button>
                <button onClick={() => updateParams('max_price', '10000000')} className="btn-quick">5-10 triệu</button>
                <button onClick={() => updateParams('max_price', '20000000')} className="btn-quick">10-20 triệu</button>
              </div>
            </div>

            <div className="filter-section">
              <h3>🔀 Sắp xếp</h3>
              <select
                value={sort}
                onChange={(e) => updateParams('sort', e.target.value)}
                className="form-control"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="popular">Bán chạy nhất</option>
              </select>
            </div>

            <button onClick={clearFilters} className="btn btn-outline btn-block">
              🔄 Xóa bộ lọc
            </button>
          </aside>

          {/* Products Grid */}
          <main className="products-main">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <p>😕 Không tìm thấy sản phẩm nào</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="products-count">Hiển thị {products.length} sản phẩm</div>
                <div className="product-grid">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                    >
                      ← Trước
                    </button>
                    
                    <span className="page-info">
                      Trang {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;