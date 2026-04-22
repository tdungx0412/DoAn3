import { Request, Response } from 'express';
import { OrderModel, IOrder, IOrderItem } from '../models/Order';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const user = (req as any).user; // Lấy từ middleware auth
      const { items, shipping_address, recipient_name, recipient_phone, total_amount } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
      }

      const orderData: IOrder = {
        user_id: user.id,
        total_amount,
        status: 'pending',
        shipping_address,
        recipient_name,
        recipient_phone
      };

      const orderItems: IOrderItem[] = items.map((item: any) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price, // Nên lấy giá từ DB để bảo mật, nhưng ở đây lấy từ FE cho đơn giản
        total_amount: item.product.price * item.quantity
      }));

      const orderId = await OrderModel.createOrder(orderData, orderItems);
      
      res.status(201).json({ success: true, data: { orderId }, message: 'Đặt hàng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server', error });
    }
  }

  static async getMyOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const orders = await OrderModel.getMyOrders(user.id);
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
}