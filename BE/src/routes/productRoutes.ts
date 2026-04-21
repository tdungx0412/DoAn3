import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', authenticateToken, authorizeRole('admin'), ProductController.create);
router.put('/:id', authenticateToken, authorizeRole('admin'), ProductController.update);
router.delete('/:id', authenticateToken, authorizeRole('admin'), ProductController.delete);

export default router;