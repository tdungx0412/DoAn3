import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import pool from './config/database'; // Import pool đã await

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '🔌 da3chdl API is running', version: '1.0.0' });
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Chỉ start server sau khi DB connect thành công
pool.then(() => {
  console.log('✅ Connected to SQL Server');
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1); // Dừng server nếu không có DB
});

export default app;