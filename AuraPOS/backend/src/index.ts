import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { posRouter } from './routes/pos';
import { shiftsRouter } from './routes/shifts';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/pos', posRouter);
app.use('/api/shifts', shiftsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AuraPOS Cloud API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[AuraPOS] Server running on http://localhost:${PORT}`);
});
