import express from 'express';
import { getLiveBids } from '../controllers/bidController.js';

const router = express.Router();

router.get('/live', getLiveBids);

export default router;
