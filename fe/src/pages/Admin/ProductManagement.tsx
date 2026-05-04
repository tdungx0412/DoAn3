import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../config';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ SỬA LỖI: Dùng number thay vì string cho id, price, stock_quantity
  const [formData, setFormData] = useState({
    id: 0, 
    name: '', 
    price: 0, 
    stock_quantity: 0, 
    is_featured: false
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll();
      setProducts(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await productService.delete(id);
        loadProducts();
      } catch (err) { alert('Lỗi khi xóa'); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // ✅ SỬA LỖI: Bỏ parseInt vì id giờ đã là number
        await productService.update(formData.id, formData);
        setIsEditing(false);
        loadProducts();
      } else {
        alert('Chức năng thêm mới cần nhiều trường dữ liệu hơn. Hiện tại chỉ hỗ trợ Sửa/Xóa.');
      }
    } catch (err) { alert('Lỗi khi lưu'); }
  };

  return (
    <div>
      <h2>📦 Danh sách sản phẩm</h2>
      
      {/* Form Sửa Nhanh */}
      {isEditing && (
        <div className="admin-form">
          <h3>Sửa sản phẩm: {formData.name}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="form-control" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Giá bán</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                className="form-control" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Số lượng kho</label>
              <input 
                type="number" 
                value={formData.stock_quantity} 
                onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} 
                className="form-control" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.is_featured} 
                  onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                /> Sản phẩm nổi bật
              </label>
            </div>
            
            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
              <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Bảng Sản Phẩm */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Kho</th>
            <th>Nổi bật</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.stock_quantity}</td>
              <td>{p.is_featured ? '✅' : ''}</td>
              <td>
                <button 
                  onClick={() => {
                    // ✅ SỬA LỖI: Ép kiểu Number cho đúng định dạng
                    setFormData({ 
                      id: p.id, 
                      name: p.name, 
                      price: Number(p.price), 
                      stock_quantity: Number(p.stock_quantity), 
                      is_featured: p.is_featured 
                    });
                    setIsEditing(true);
                  }} 
                  className="btn btn-sm btn-outline"
                >
                  Sửa
                </button>
                <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;