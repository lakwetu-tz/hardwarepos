import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, authorize(['ADMIN']), userController.getAllUsers);
router.post('/', authMiddleware, authorize(['ADMIN']), userController.createUser);
router.delete('/:id', authMiddleware, authorize(['ADMIN']), userController.deleteUser);

export default router;
