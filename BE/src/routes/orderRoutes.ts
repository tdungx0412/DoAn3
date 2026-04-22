import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Các route này yêu cầu đăng nhập
router.use(authenticateToken);

router.post('/', OrderController.createOrder);
router.get('/my-orders', OrderController.getMyOrders);

export default router;