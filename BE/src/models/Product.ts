import sql from 'mssql';
import pool from '../config/database';

export interface IProduct {
  id?: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  category_id?: number;
  brand_id?: number;
  sku?: string;
  stock_quantity?: number;
  warranty_months?: number;
  capacity?: string;
  power_consumption?: string;
  energy_rating?: string;
  dimensions?: string;
  weight?: string;
  color?: string;
  main_image?: string;
  images?: string;
  is_featured?: boolean;
  status?: string;
}

export class ProductModel {
  static async findAll(filters: any = {}): Promise<IProduct[]> {
    const conn = await pool;
    let query = `SELECT * FROM products WHERE status = @status ORDER BY created_at DESC`;
    const request = conn.request().input('status', sql.NVarChar, filters.status || 'active');

    if (filters.category_id) {
      query += ` AND category_id = @category_id`;
      request.input('category_id', sql.Int, filters.category_id);
    }
    if (filters.brand_id) {
      query += ` AND brand_id = @brand_id`;
      request.input('brand_id', sql.Int, filters.brand_id);
    }
    if (filters.min_price) {
      query += ` AND price >= @min_price`;
      request.input('min_price', sql.Decimal(15,2), filters.min_price);
    }
    if (filters.max_price) {
      query += ` AND price <= @max_price`;
      request.input('max_price', sql.Decimal(15,2), filters.max_price);
    }
    if (filters.keyword) {
      query += ` AND (name LIKE @keyword OR short_description LIKE @keyword)`;
      request.input('keyword', sql.NVarChar, `%${filters.keyword}%`);
    }

    const result = await request.query(query);
    return result.recordset;
  }

  static async findById(id: number): Promise<IProduct | null> {
    const conn = await pool;
    const result = await conn.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM products WHERE id = @id`);
    return result.recordset[0] || null;
  }

  static async create(product: IProduct): Promise<IProduct> {
    const conn = await pool;
    const request = conn.request();
    const fields: string[] = [];
    const values: string[] = [];

    Object.entries(product).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(key);
        values.push(`@${key}`);
        const type = typeof value === 'number' ? (key.includes('price') ? sql.Decimal(15,2) : sql.Int) : sql.NVarChar;
        request.input(key, type, value);
      }
    });

    const result = await request.query(`
      INSERT INTO products (${fields.join(', ')}) VALUES (${values.join(', ')})
      OUTPUT INSERTED.*
    `);
    return result.recordset[0];
  }

  static async update(id: number, product: Partial<IProduct>): Promise<IProduct | null> {
    const conn = await pool;
    const request = conn.request();
    const sets: string[] = [];

    Object.entries(product).forEach(([key, value]) => {
      if (value !== undefined) {
        sets.push(`${key} = @${key}`);
        const type = typeof value === 'number' ? (key.includes('price') ? sql.Decimal(15,2) : sql.Int) : sql.NVarChar;
        request.input(key, type, value);
      }
    });

    request.input('id', sql.Int, id);
    sets.push(`updated_at = GETDATE()`);

    const result = await request.query(`
      UPDATE products SET ${sets.join(', ')} WHERE id = @id
      OUTPUT INSERTED.*
    `);
    return result.recordset[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const conn = await pool;
    const result = await conn.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM products WHERE id = @id`);
    return result.rowsAffected[0] > 0;
  }
}