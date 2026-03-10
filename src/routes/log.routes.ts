import { Router } from 'express';
import * as logController from '../controllers/log.controller';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, authorize(['ADMIN']), logController.getAllLogs);

export default router;
