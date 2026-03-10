import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);

export default router;
