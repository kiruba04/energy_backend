import express from 'express';
import { registerUser, registerCompany, login, checkAuth, logout} from '../controllers/auth.js';

const router = express.Router();

// Register routes
router.post('/register/user', registerUser);
router.post('/register/company', registerCompany);

// Unified login route
router.post('/login', login);

// Auth routes
router.get('/checkauth', checkAuth);
router.post('/logout', logout);



export default router;
