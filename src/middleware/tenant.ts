import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

export const tenantMiddleware = (req: TenantRequest, res: Response, next: NextFunction) => {
  const tenantId = req.header('X-Tenant-ID');
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  req.tenantId = tenantId;
  next();
};
