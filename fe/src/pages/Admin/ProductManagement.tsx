import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../config';

interface ProductForm {
  id?: number;
  name: string;
  slug: string;
  category_id: number;
  brand_id: number;
  price: number;
  original_price: number;
  discount_percent: number;
  stock_quantity: number;
  sku: string;
  short_description: string;
  main_image: string;
  is_featured: boolean;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '', slug: '', category_id: 1, brand_id: 1, price: 0,
    original_price: 0, discount_percent: 0, stock_quantity: 0,
    sku: '', short_description: '', main_image: '', is_featured: false
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Lấy nhiều sản phẩm hơn cho admin
      const res = await productService.getAll({ limit: 200, sort: 'newest' });
      setProducts(res.data || []);
    } catch (err) { console.error('Lỗi tải sản phẩm:', err); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('️ Bạn có chắc muốn xóa sản phẩm này? Hành động không thể hoàn tác.')) {
      try {
        await productService.delete(id);
        loadProducts();
      } catch (err) { alert('Lỗi khi xóa sản phẩm'); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await productService.update(formData.id, formData);
      } else {
        await productService.create(formData);
      }
      setShowForm(false);
      setIsEditing(false);
      loadProducts();
      alert(isEditing ? '✅ Cập nhật thành công!' : '✅ Thêm sản phẩm thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || '❌ Lỗi khi lưu sản phẩm');
    }
  };

  const openEdit = (p: any) => {
    setFormData({
      id: p.id,
      name: p.name,
      slug: p.slug || '',
      category_id: p.category_id || 1,
      brand_id: p.brand_id || 1,
      price: p.price,
      original_price: p.original_price || p.price,
      discount_percent: p.discount_percent || 0,
      stock_quantity: p.stock_quantity,
      sku: p.sku || '',
      short_description: p.short_description || '',
      main_image: p.main_image || '',
      is_featured: p.is_featured
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const openAdd = () => {
    setFormData({
      name: '', slug: '', category_id: 1, brand_id: 1, price: 0,
      original_price: 0, discount_percent: 0, stock_quantity: 0,
      sku: '', short_description: '', main_image: '', is_featured: false
    });
    setIsEditing(false);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>📦 Danh sách sản phẩm ({products.length})</h2>
        <button onClick={openAdd} className="btn btn-primary">➕ Thêm sản phẩm mới</button>
      </div>

      {/* Form Thêm/Sửa */}
      {showForm && (
        <div className="admin-form">
          <h3>{isEditing ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Slug (URL)</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="form-control" placeholder="tu-lanh-panasonic-400l" />
              </div>
              <div className="form-group">
                <label>ID Danh mục *</label>
                <input type="number" value={formData.category_id} onChange={e => setFormData({...formData, category_id: Number(e.target.value)})} className="form-control" required min="1" />
                <small style={{color: '#666'}}>1: Tủ lạnh, 2: Máy lạnh, 3: Máy giặt, 4: Tủ đông, 5: Quạt, 6: Lọc khí</small>
              </div>
              <div className="form-group">
                <label>ID Hãng *</label>
                <input type="number" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: Number(e.target.value)})} className="form-control" required min="1" />
                <small style={{color: '#666'}}>1: Panasonic, 2: Daikin, 3: Samsung, 4: LG, 5: Toshiba, 6: Electrolux, 7: Mitsubishi, 8: Khác</small>
              </div>
              <div className="form-group">
                <label>Giá bán *</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Giá gốc</label>
                <input type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: Number(e.target.value)})} className="form-control" />
              </div>
              <div className="form-group">
                <label>Giảm giá (%)</label>
                <input type="number" value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: Number(e.target.value)})} className="form-control" min="0" max="100" />
              </div>
              <div className="form-group">
                <label>Số lượng kho *</label>
                <input type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} className="form-control" required min="0" />
              </div>
              <div className="form-group">
                <label>SKU (Mã kho)</label>
                <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="form-control" placeholder="VD: PAN-NR-BL418" />
              </div>
              <div className="form-group">
                <label>Link ảnh chính</label>
                <input type="text" value={formData.main_image} onChange={e => setFormData({...formData, main_image: e.target.value})} className="form-control" placeholder="https://via.placeholder.com/400" />
              </div>
            </div>
            <div className="form-group" style={{marginTop: 15}}>
              <label>Mô tả ngắn</label>
              <textarea value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} className="form-control" rows={2} />
            </div>
            <div className="form-group" style={{marginTop: 10}}>
              <label style={{cursor: 'pointer'}}>
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} style={{marginRight: 8}} />
                Đánh dấu sản phẩm nổi bật
              </label>
            </div>
            <div style={{display: 'flex', gap: 10, marginTop: 20}}>
              <button type="submit" className="btn btn-primary">💾 Lưu sản phẩm</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">❌ Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng Sản Phẩm */}
      <div style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Hãng</th>
              <th>Giá</th>
              <th>Giảm giá</th>
              <th>Kho</th>
              <th>Nổi bật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td style={{maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={p.name}>
                  {p.name}
                </td>
                <td>{p.category_name || `ID: ${p.category_id}`}</td>
                <td>{p.brand_name || `ID: ${p.brand_id}`}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.discount_percent > 0 ? `${p.discount_percent}%` : '-'}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.is_featured ? '✅' : ''}</td>
                <td>
                  <button onClick={() => openEdit(p)} className="btn btn-sm btn-outline">✏️ Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">🗑️ Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;