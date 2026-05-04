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