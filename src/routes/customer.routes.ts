import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Apply authMiddleware to all routes to ensure req.user is populated
router.use(authMiddleware);

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.put('/:id', authorize(['ADMIN']), customerController.updateCustomer);
router.delete('/:id', authorize(['ADMIN']), customerController.deleteCustomer);

export default router;
