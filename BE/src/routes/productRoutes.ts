import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticateToken, authorizeRole('admin'), createProduct);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteProduct);

export default router;