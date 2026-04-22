import sql from 'mssql';
import pool from '../config/database';

export interface IOrder {
  id?: number;
  user_id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  recipient_name: string;
  recipient_phone: string;
  created_at?: Date;
}

export interface IOrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_amount: number;
}

export class OrderModel {
  // Tạo đơn hàng mới
  static async createOrder(order: IOrder, items: IOrderItem[]): Promise<number> {
    const conn = await pool;
    const transaction = new sql.Transaction(conn);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);

      // 1. Insert vào bảng Orders
      const orderResult = await request
        .input('user_id', sql.Int, order.user_id)
        .input('total_amount', sql.Decimal(15, 2), order.total_amount)
        .input('status', sql.NVarChar, 'pending')
        .input('shipping_address', sql.NVarChar, order.shipping_address)
        .input('recipient_name', sql.NVarChar, order.recipient_name)
        .input('recipient_phone', sql.NVarChar, order.recipient_phone)
        .query(`
          INSERT INTO orders (user_id, total_amount, status, shipping_address, recipient_name, recipient_phone)
          OUTPUT INSERTED.id
          VALUES (@user_id, @total_amount, @status, @shipping_address, @recipient_name, @recipient_phone)
        `);

      const orderId = orderResult.recordset[0].id;

      // 2. Insert từng sản phẩm vào bảng Order Items
      const itemRequest = new sql.Request(transaction);
      
      for (const item of items) {
        await itemRequest
          .input('order_id', sql.Int, orderId)
          .input('product_id', sql.Int, item.product_id)
          .input('product_name', sql.NVarChar, item.product_name)
          .input('quantity', sql.Int, item.quantity)
          .input('price', sql.Decimal(15, 2), item.price)
          .input('total_amount', sql.Decimal(15, 2), item.total_amount)
          .query(`
            INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total_amount)
            VALUES (@order_id, @product_id, @product_name, @quantity, @price, @total_amount)
          `);
      }

      await transaction.commit();
      return orderId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Lấy danh sách đơn hàng của user
  static async getMyOrders(userId: number): Promise<any[]> {
    const conn = await pool;
    const result = await conn.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at 
        FROM orders o 
        WHERE o.user_id = @user_id 
        ORDER BY o.created_at DESC
      `);
    return result.recordset;
  }
}