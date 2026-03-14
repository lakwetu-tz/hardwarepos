import express from 'express';
import cors from 'cors';
import { tenantMiddleware } from './middleware/tenant';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import categoryRoutes from './routes/category.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import logRoutes from './routes/log.routes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Public health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth Routes (Public login)
app.use('/auth', authRoutes);

app.use(express.static(path.join(__dirname, '../public')));

// Protected API Routes
// Note: tenantMiddleware adds req.tenantId
app.use('/api/products', tenantMiddleware, productRoutes);
app.use('/api/customers', tenantMiddleware, customerRoutes);
app.use('/api/orders', tenantMiddleware, orderRoutes);
app.use('/api/categories', tenantMiddleware, categoryRoutes);
app.use('/api/reports', tenantMiddleware, reportRoutes);
app.use('/api/users', tenantMiddleware, userRoutes);
app.use('/api/logs', tenantMiddleware, logRoutes);

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');

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
