import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware'; // Middleware kiểm tra đăng nhập
import { createOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController';

const router = Router();

// POST: Tạo đơn hàng (Khách hàng dùng)
router.post('/', authMiddleware, createOrder);

// GET: Lấy danh sách đơn hàng (Admin dùng)
router.get('/', authMiddleware, getAllOrders);

// PATCH: Cập nhật trạng thái (Admin dùng)
router.patch('/:id/status', authMiddleware, updateOrderStatus);

export default router;