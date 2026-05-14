import { Request, Response } from 'express';
import sql from 'mssql';
import { getPool } from '../config/database'; // Import đúng cách

// ==========================================
// ✅ 1. HÀM TẠO ĐƠN HÀNG (Giữ nguyên logic cũ)
// ==========================================
export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items, shipping_address, recipient_name, recipient_phone, customer_note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }
    if (!user || !user.id) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const price = item.product.price || item.price;
      const quantity = item.quantity;
      subtotal += price * quantity;
      return {
        product_id: item.product.id,
        product_name: item.product.name,
        sku: item.product.sku || '',
        quantity,
        price,
        total_amount: price * quantity
      };
    });

    const total_amount = subtotal;
    const order_number = `DL${Date.now()}`;
    const pool = await getPool(); // ✅ Dùng getPool()

    const orderResult = await pool.request()
      .input('order_number', sql.NVarChar, order_number)
      .input('user_id', sql.Int, user.id)
      .input('recipient_name', sql.NVarChar, recipient_name || 'Khách hàng')
      .input('recipient_phone', sql.NVarChar, recipient_phone || '')
      .input('shipping_address', sql.NVarChar, shipping_address || '')
      .input('subtotal', sql.Decimal(15, 2), subtotal)
      .input('total_amount', sql.Decimal(15, 2), total_amount)
      .input('customer_note', sql.NVarChar, customer_note || '')
      .input('payment_method', sql.NVarChar, 'cod')
      .query(`
        INSERT INTO orders (order_number, user_id, recipient_name, recipient_phone, shipping_address, 
                            subtotal, total_amount, status, payment_method, payment_status, customer_note)
        OUTPUT INSERTED.id
        VALUES (@order_number, @user_id, @recipient_name, @recipient_phone, @shipping_address, 
                @subtotal, @total_amount, 'pending', @payment_method, 'unpaid', @customer_note)
      `);

    const orderId = orderResult.recordset[0].id;

    // Insert chi tiết đơn hàng & trừ kho
    for (const item of orderItems) {
      await pool.request()
        .input('order_id', sql.Int, orderId)
        .input('product_id', sql.Int, item.product_id)
        .input('product_name', sql.NVarChar, item.product_name)
        .input('quantity', sql.Int, item.quantity)
        .input('price', sql.Decimal(15, 2), item.price)
        .input('total_amount', sql.Decimal(15, 2), item.total_amount)
        .query(`INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total_amount) VALUES (@order_id, @product_id, @product_name, @quantity, @price, @total_amount)`);
      
      await pool.request().input('product_id', sql.Int, item.product_id).input('quantity', sql.Int, item.quantity)
        .query(`UPDATE products SET stock_quantity = stock_quantity - @quantity WHERE id = @product_id`);
    }

    res.status(201).json({ success: true, data: { orderId, order_number }, message: 'Đặt hàng thành công' });
  } catch (error: any) {
    console.error('❌ Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ✅ 2. HÀM LẤY DANH SÁCH ĐƠN HÀNG (QUAN TRỌNG)
// ==========================================
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const pool = await getPool(); // ✅ Dùng getPool()
    const result = await pool.request().query(`
      SELECT 
        o.id, 
        o.order_number, 
        o.recipient_name, 
        o.recipient_phone, 
        o.shipping_address, 
        o.total_amount, 
        o.status, 
        o.payment_status, 
        o.created_at,
        u.full_name as account_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error: any) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ✅ 3. CẬP NHẬT TRẠNG THÁI
// ==========================================
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = await getPool(); // ✅ Dùng getPool()
    
    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('status', sql.NVarChar, status)
      .query('UPDATE orders SET status = @status WHERE id = @id');

    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};