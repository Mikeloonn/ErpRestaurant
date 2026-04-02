import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import { errorHandler } from './middleware/error';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- MIDDLEWARES GLOBALES ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check: Para saber si el backend está vivo
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'DB connection failed' });
  }
});

// Pedidos: Modularizado profesionalmente
app.use('/api/orders', orderRoutes);

// Autenticación: Seguro con Bcrypt
app.use('/api/auth', authRoutes);

// --- MANEJADOR DE ERRORES GLOBAL ---
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Servidor Backend Modularizado en http://localhost:${port}`);
});
