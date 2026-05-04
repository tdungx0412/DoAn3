import { Router } from 'express';
import { createOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createOrder);
router.get('/my-orders', getAllOrders); 
// Admin routes
router.get('/admin', authorizeRole('admin'), getAllOrders); 
router.put('/:id/status', authorizeRole('admin'), updateOrderStatus);

export default router;