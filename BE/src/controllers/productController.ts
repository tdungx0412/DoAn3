import { Request, Response } from 'express';
import sql from 'mssql';
import pool from '../config/database';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      category_id,
      brand_id,
      min_price,
      max_price,
      sort = 'newest',
      page = 1,
      limit = 12,
      status = 'active'
    } = req.query;

    const conn = await pool;
    let query = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;

    const request = new sql.Request(conn);

    // Xây dựng query động
    if (status) {
      query += ` AND p.status = @status`;
      request.input('status', sql.NVarChar, status);
    }
    if (keyword) {
      query += ` AND (p.name LIKE @keyword OR p.short_description LIKE @keyword)`;
      request.input('keyword', sql.NVarChar, `%${keyword}%`);
    }
    if (category_id) {
      query += ` AND p.category_id = @category_id`;
      request.input('category_id', sql.Int, parseInt(category_id as string));
    }
    if (brand_id) {
      query += ` AND p.brand_id = @brand_id`;
      request.input('brand_id', sql.Int, parseInt(brand_id as string));
    }
    if (min_price) {
      query += ` AND p.price >= @min_price`;
      request.input('min_price', sql.Decimal(15, 2), parseFloat(min_price as string));
    }
    if (max_price) {
      query += ` AND p.price <= @max_price`;
      request.input('max_price', sql.Decimal(15, 2), parseFloat(max_price as string));
    }

    // Sắp xếp
    switch (sort) {
      case 'price_asc': query += ` ORDER BY p.price ASC`; break;
      case 'price_desc': query += ` ORDER BY p.price DESC`; break;
      case 'name_asc': query += ` ORDER BY p.name ASC`; break;
      case 'popular': query += ` ORDER BY p.sold_count DESC, p.view_count DESC`; break;
      default: query += ` ORDER BY p.created_at DESC`;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Lấy tổng số bản ghi (bỏ phần ORDER BY để đếm chính xác)
    const countQuery = query.replace(/ORDER BY[\s\S]+$/i, '');
    const countResult = await request.query(`SELECT COUNT(*) as total FROM (${countQuery}) AS temp`);
    const total = countResult.recordset[0].total;

    // Thêm phân trang
    query += ` OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limitNum);

    const result = await request.query(query);

    // ✅ ĐÃ SỬA LỖI: Thêm key "data:"
    res.json({
      success: true,
      data: result.recordset,
      total,
      page: pageNum,
      total_pages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conn = await pool;

    const result = await conn.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT p.*, c.name as category_name, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Tăng lượt xem
    await conn.request()
      .input('id', sql.Int, parseInt(id))
      .query(`UPDATE products SET view_count = view_count + 1 WHERE id = @id`);

    // ✅ ĐÃ SỬA LỖI: Thêm key "data:"
    res.json({ success: true, data: result.recordset[0] });
  } catch (error: any) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};






// cho quản lý
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const conn = await pool;
    
    const result = await conn.request()
      .input('name', sql.NVarChar, productData.name)
      .input('slug', sql.NVarChar, productData.slug)
      .input('short_description', sql.NVarChar, productData.short_description)
      .input('price', sql.Decimal(15, 2), productData.price)
      .input('original_price', sql.Decimal(15, 2), productData.original_price)
      .input('discount_percent', sql.Int, productData.discount_percent)
      .input('category_id', sql.Int, productData.category_id)
      .input('brand_id', sql.Int, productData.brand_id)
      .input('sku', sql.NVarChar, productData.sku)
      .input('stock_quantity', sql.Int, productData.stock_quantity)
      .input('main_image', sql.NVarChar, productData.main_image)
      .input('is_featured', sql.Bit, productData.is_featured)
      .query(`
        INSERT INTO products (name, slug, short_description, price, original_price, discount_percent, 
                              category_id, brand_id, sku, stock_quantity, main_image, is_featured)
        OUTPUT INSERTED.*
        VALUES (@name, @slug, @short_description, @price, @original_price, @discount_percent,
                @category_id, @brand_id, @sku, @stock_quantity, @main_image, @is_featured)
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const conn = await pool;

    // Cập nhật đầy đủ các trường quan trọng
    await conn.request()
      .input('id', sql.Int, parseInt(id))
      .input('name', sql.NVarChar, productData.name)
      .input('slug', sql.NVarChar, productData.slug)
      .input('short_description', sql.NVarChar, productData.short_description)
      .input('price', sql.Decimal(15, 2), productData.price)
      .input('original_price', sql.Decimal(15, 2), productData.original_price)
      .input('discount_percent', sql.Int, productData.discount_percent)
      .input('category_id', sql.Int, productData.category_id)
      .input('brand_id', sql.Int, productData.brand_id)
      .input('sku', sql.NVarChar, productData.sku)
      .input('stock_quantity', sql.Int, productData.stock_quantity)
      .input('main_image', sql.NVarChar, productData.main_image)
      .input('is_featured', sql.Bit, productData.is_featured)
      .query(`
        UPDATE products 
        SET name = @name,
            slug = @slug,
            short_description = @short_description,
            price = @price,
            original_price = @original_price,
            discount_percent = @discount_percent,
            category_id = @category_id,
            brand_id = @brand_id,
            sku = @sku,
            stock_quantity = @stock_quantity,
            main_image = @main_image,
            is_featured = @is_featured,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
  } catch (error: any) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conn = await pool;
    
    await conn.request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM products WHERE id = @id');

    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};