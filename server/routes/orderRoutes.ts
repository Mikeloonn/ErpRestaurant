import { Router } from 'express';
import { createOrder } from '../controllers/orderController';

const router = Router();

// Endpoint para crear pedidos: POST /api/orders
router.post('/', createOrder);

export default router;
