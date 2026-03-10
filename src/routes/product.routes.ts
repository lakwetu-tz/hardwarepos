import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

router.get('/', productController.getAllProducts);
router.post('/', authMiddleware, authorize(['ADMIN']), productController.createProduct);
router.put('/:id', authMiddleware, authorize(['ADMIN']), productController.updateProduct);
router.delete('/:id', authMiddleware, authorize(['ADMIN']), productController.deleteProduct);

export default router;
