import express from 'express';
import { getLiveBids, getAllBids} from '../controllers/bidController.js';

const router = express.Router();

router.get('/live', getLiveBids);
router.get('/getallbids', getAllBids);  // Define the route to get all bids
export default router;
