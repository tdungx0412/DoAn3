import React, { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../config';
import api from '../../services/api';

interface ProductForm {
  id?: number; name: string; slug: string; category_id: number; brand_id: number;
  price: number; original_price: number; discount_percent: number; stock_quantity: number;
  sku: string; short_description: string; main_image: string; is_featured: boolean;
}
interface Category { id: number; name: string; }
interface Brand { id: number; name: string; }

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '', slug: '', category_id: 1, brand_id: 1, price: 0, original_price: 0,
    discount_percent: 0, stock_quantity: 0, sku: '', short_description: '', main_image: '', is_featured: false
  });

  useEffect(() => { loadProducts(); loadRefData(); }, []);

  const loadRefData = async () => {
    try {
      const [c, b] = await Promise.all([api.get('/categories'), api.get('/brands')]);
      setCategories(c.data.data || [{ id:1, name:'Tủ lạnh' },{ id:2, name:'Máy lạnh' },{ id:3, name:'Máy giặt' },{ id:4, name:'Tủ đông' },{ id:5, name:'Quạt' },{ id:6, name:'Lọc khí' }]);
      setBrands(b.data.data || [{ id:1, name:'Panasonic' },{ id:2, name:'Daikin' },{ id:3, name:'Samsung' },{ id:4, name:'LG' },{ id:5, name:'Toshiba' },{ id:6, name:'Electrolux' },{ id:7, name:'Mitsubishi' },{ id:8, name:'Aqua' }]);
    } catch { console.log('Dùng data mẫu'); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ limit: 200, sort: 'newest' });
      setAllProducts(res.data || []);
      applyFilters(res.data || []);
    } finally { setLoading(false); }
  };

  const applyFilters = (data: any[]) => {
    let f = [...data];
    if (filterCategory) f = f.filter(p => p.category_id === parseInt(filterCategory));
    if (filterBrand) f = f.filter(p => p.brand_id === parseInt(filterBrand));
    setProducts(f);
  };

  useEffect(() => { applyFilters(allProducts); }, [filterCategory, filterBrand]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Xác nhận xóa?')) {
      try { await productService.delete(id); loadProducts(); } catch { alert('Lỗi xóa'); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) await productService.update(formData.id, formData);
      else await productService.create(formData);
      setShowForm(false); setIsEditing(false); loadProducts();
      alert(isEditing ? '✅ Đã cập nhật' : '✅ Đã thêm mới');
    } catch (err: any) { alert(err.response?.data?.message || 'Lỗi lưu'); }
  };

  const openEdit = (p: any) => {
    setFormData({ id: p.id, name: p.name, slug: p.slug || '', category_id: p.category_id || 1, brand_id: p.brand_id || 1, price: p.price, original_price: p.original_price || p.price, discount_percent: p.discount_percent || 0, stock_quantity: p.stock_quantity, sku: p.sku || '', short_description: p.short_description || '', main_image: p.main_image || '', is_featured: p.is_featured });
    setIsEditing(true); setShowForm(true);
  };

  const openAdd = () => {
    setFormData({ name: '', slug: '', category_id: 1, brand_id: 1, price: 0, original_price: 0, discount_percent: 0, stock_quantity: 0, sku: '', short_description: '', main_image: '', is_featured: false });
    setIsEditing(false); setShowForm(true);
  };

  const quickImages = [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    'https://images.unsplash.com/photo-1614631338827-e5913b8acb56?w=400',
    'https://images.unsplash.com/photo-1626806819292-5619a6193fda?w=400',
    'https://images.unsplash.com/photo-1585771724684-3826fd5919f8?w=400'
  ];

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
        <h2>📦 Danh sách sản phẩm ({products.length})</h2>
        <button onClick={openAdd} className="btn btn-primary">➕ Thêm mới</button>
      </div>

      <div style={{background:'#f8f9fa', padding:15, borderRadius:8, marginBottom:20}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:15}}>
          <div>
            <label>Danh mục</label>
            <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="form-control">
              <option value="">Tất cả</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Hãng</label>
            <select value={filterBrand} onChange={e=>setFilterBrand(e.target.value)} className="form-control">
              <option value="">Tất cả</option>
              {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{display:'flex', alignItems:'end'}}>
            <button onClick={()=>{setFilterCategory('');setFilterBrand('')}} className="btn btn-outline w-100">🔄 Xóa lọc</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="admin-form" style={{background:'#fff', padding:20, border:'1px solid #ddd', borderRadius:8, marginBottom:20}}>
          <h3>{isEditing ? '✏️ Sửa' : '➕ Thêm'} sản phẩm</h3>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
              <div className="form-group"><label>Tên *</label><input value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="form-control" required /></div>
              <div className="form-group"><label>Slug</label><input value={formData.slug} onChange={e=>setFormData({...formData, slug:e.target.value.toLowerCase().replace(/\s+/g,'-')})} className="form-control" /></div>
              <div className="form-group"><label>Danh mục *</label>
                <select value={formData.category_id} onChange={e=>setFormData({...formData, category_id:Number(e.target.value)})} className="form-control" required>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Hãng *</label>
                <select value={formData.brand_id} onChange={e=>setFormData({...formData, brand_id:Number(e.target.value)})} className="form-control" required>
                  {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Giá bán *</label><input type="number" value={formData.price} onChange={e=>setFormData({...formData, price:Number(e.target.value)})} className="form-control" required /></div>
              <div className="form-group"><label>Giá gốc</label><input type="number" value={formData.original_price} onChange={e=>setFormData({...formData, original_price:Number(e.target.value)})} className="form-control" /></div>
              <div className="form-group"><label>Giảm giá (%)</label><input type="number" value={formData.discount_percent} onChange={e=>setFormData({...formData, discount_percent:Number(e.target.value)})} className="form-control" min={0} max={100} /></div>
              <div className="form-group"><label>Số kho *</label><input type="number" value={formData.stock_quantity} onChange={e=>setFormData({...formData, stock_quantity:Number(e.target.value)})} className="form-control" required /></div>
              <div className="form-group"><label>SKU</label><input value={formData.sku} onChange={e=>setFormData({...formData, sku:e.target.value})} className="form-control" /></div>
              <div className="form-group">
                <label>Link ảnh sản phẩm</label>
                <input value={formData.main_image} onChange={e=>setFormData({...formData, main_image:e.target.value})} className="form-control" placeholder="https://..." />
                <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
                  {quickImages.map((url, i) => (
                    <img key={i} src={url} alt="mẫu" style={{width:50, height:50, objectFit:'cover', cursor:'pointer', border:'1px solid #ddd', borderRadius:4}} onClick={()=>setFormData({...formData, main_image:url})} />
                  ))}
                </div>
                {formData.main_image && <img src={formData.main_image} alt="preview" style={{maxWidth:150, marginTop:10, borderRadius:6, border:'2px solid #eee'}} onError={e=>(e.target as HTMLImageElement).style.display='none'} />}
              </div>
            </div>
            <div className="form-group" style={{marginTop:15}}>
              <label>Mô tả ngắn</label>
              <textarea value={formData.short_description} onChange={e=>setFormData({...formData, short_description:e.target.value})} className="form-control" rows={2} />
            </div>
            <div style={{display:'flex', gap:10, marginTop:15}}>
              <button type="submit" className="btn btn-primary">💾 Lưu</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn btn-outline">❌ Hủy</button>
            </div>
          </form>
        </div>
      )}

      <table className="admin-table">
        <thead><tr><th>ID</th><th>Tên</th><th>Danh mục</th><th>Hãng</th><th>Giá</th><th>Kho</th><th>Ảnh</th><th>Thao tác</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td style={{maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={p.name}>{p.name}</td>
              <td>{p.category_name || `ID:${p.category_id}`}</td>
              <td>{p.brand_name || `ID:${p.brand_id}`}</td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.stock_quantity}</td>
              <td><img src={p.main_image || 'https://via.placeholder.com/50'} alt="" style={{width:40, height:40, objectFit:'cover', borderRadius:4}} /></td>
              <td>
                <button onClick={()=>openEdit(p)} className="btn btn-sm btn-outline">Sửa</button>
                <button onClick={()=>handleDelete(p.id)} className="btn btn-sm btn-danger">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;