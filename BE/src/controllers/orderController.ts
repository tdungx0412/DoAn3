import { Request, Response } from 'express';
import sql from 'mssql';
import pool from '../config/database';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items, shipping_address, recipient_name, recipient_phone, customer_note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    // Tính toán tổng tiền
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const price = item.product.price || item.price;
      const quantity = item.quantity;
      const total = price * quantity;
      subtotal += total;
      return {
        product_id: item.product.id,
        product_name: item.product.name,
        sku: item.product.sku || '',
        quantity,
        price,
        discount_amount: 0,
        total_amount: total
      };
    });

    const shipping_fee = 0;
    const discount_amount = 0;
    const total_amount = subtotal + shipping_fee - discount_amount;
    const order_number = `DL${Date.now()}`; // Mã đơn hàng duy nhất

    const conn = await pool;
    const transaction = new sql.Transaction(conn);

    try {
      await transaction.begin();

      // 1. Insert đơn hàng chính
      const orderResult = await new sql.Request(transaction)
        .input('order_number', sql.NVarChar, order_number)
        .input('user_id', sql.Int, user.id)
        .input('recipient_name', sql.NVarChar, recipient_name)
        .input('recipient_phone', sql.NVarChar, recipient_phone)
        .input('shipping_address', sql.NVarChar, shipping_address)
        .input('subtotal', sql.Decimal(15, 2), subtotal)
        .input('shipping_fee', sql.Decimal(15, 2), shipping_fee)
        .input('discount_amount', sql.Decimal(15, 2), discount_amount)
        .input('total_amount', sql.Decimal(15, 2), total_amount)
        .input('customer_note', sql.NVarChar, customer_note || '')
        .input('payment_method', sql.NVarChar, 'cod') // Mặc định COD
        .query(`
          INSERT INTO orders (order_number, user_id, recipient_name, recipient_phone, shipping_address, 
                              subtotal, shipping_fee, discount_amount, total_amount, status, payment_method, payment_status, customer_note)
          OUTPUT INSERTED.id
          VALUES (@order_number, @user_id, @recipient_name, @recipient_phone, @shipping_address, 
                  @subtotal, @shipping_fee, @discount_amount, @total_amount, 'pending', @payment_method, 'unpaid', @customer_note)
        `);

      const orderId = orderResult.recordset[0].id;

      // 2. Insert chi tiết đơn hàng
      const itemRequest = new sql.Request(transaction);
      for (const item of orderItems) {
        await itemRequest
          .input('order_id', sql.Int, orderId)
          .input('product_id', sql.Int, item.product_id)
          .input('product_name', sql.NVarChar, item.product_name)
          .input('sku', sql.NVarChar, item.sku)
          .input('quantity', sql.Int, item.quantity)
          .input('price', sql.Decimal(15, 2), item.price)
          .input('discount_amount', sql.Decimal(15, 2), item.discount_amount)
          .input('total_amount', sql.Decimal(15, 2), item.total_amount)
          .query(`
            INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, price, discount_amount, total_amount)
            VALUES (@order_id, @product_id, @product_name, @sku, @quantity, @price, @discount_amount, @total_amount)
          `);
      }

      // 3. Trừ kho & tăng số lượng bán
      for (const item of orderItems) {
        await new sql.Request(transaction)
          .input('product_id', sql.Int, item.product_id)
          .input('quantity', sql.Int, item.quantity)
          .query(`UPDATE products SET stock_quantity = stock_quantity - @quantity, sold_count = sold_count + @quantity WHERE id = @product_id`);
      }

      await transaction.commit();
      res.status(201).json({ success: true, data: { orderId, order_number }, message: 'Đặt hàng thành công' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error: any) {
    console.error(' Order Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server khi tạo đơn hàng' });
  }
};