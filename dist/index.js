"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const tenant_1 = require("./middleware/tenant");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const log_routes_1 = __importDefault(require("./routes/log.routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Public health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Auth Routes (Public login)
app.use('/auth', auth_routes_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Protected API Routes
// Note: tenantMiddleware adds req.tenantId
app.use('/api/products', tenant_1.tenantMiddleware, product_routes_1.default);
app.use('/api/customers', tenant_1.tenantMiddleware, customer_routes_1.default);
app.use('/api/orders', tenant_1.tenantMiddleware, order_routes_1.default);
app.use('/api/categories', tenant_1.tenantMiddleware, category_routes_1.default);
app.use('/api/reports', tenant_1.tenantMiddleware, report_routes_1.default);
app.use('/api/users', tenant_1.tenantMiddleware, user_routes_1.default);
app.use('/api/logs', tenant_1.tenantMiddleware, log_routes_1.default);
app.get('*', (req, res) => {
    const indexPath = path_1.default.join(__dirname, '../public/index.html');
    // Debug: log what path we're trying to send (visible in docker logs)
    console.log('SPA fallback: attempting to send →', indexPath);
    res.sendFile(indexPath, err => {
        if (err) {
            console.error('sendFile failed:', err.message);
            if (!res.headersSent) {
                res.status(404).send('Not Found - index.html missing');
            }
        }
    });
});
// Catch-all 404
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
