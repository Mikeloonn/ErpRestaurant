import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

// Endpoint de login: POST /api/auth/login
router.post('/login', login);

export default router;
