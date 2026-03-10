import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware, authorize(['ADMIN']), categoryController.createCategory);

export default router;
