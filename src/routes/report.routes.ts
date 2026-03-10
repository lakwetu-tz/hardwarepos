import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard-detailed', authMiddleware, authorize(['ADMIN']), reportController.getDashboardDetailed);

export default router;
