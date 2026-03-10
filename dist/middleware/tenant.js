"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
const tenantMiddleware = (req, res, next) => {
    const tenantId = req.header('X-Tenant-ID');
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
    }
    req.tenantId = tenantId;
    next();
};
exports.tenantMiddleware = tenantMiddleware;
