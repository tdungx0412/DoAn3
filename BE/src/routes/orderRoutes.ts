import { Router } from 'express';
import { createOrder } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken); 

router.post('/', createOrder);

export default router;