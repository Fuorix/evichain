import { Router }  from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNonce, login, getMe, getProfile } from '../controllers/authController.js';

const router = Router();

// Public routes
router.get('/nonce', getNonce);   // GET  /api/auth/nonce
router.post('/login', login);      // POST /api/auth/login

// Protected
router.get('/me', authenticate, getMe); // GET /api/auth/me
router.get('/profile', authenticate, getProfile); // GET /api/auth/profile

export default router;
