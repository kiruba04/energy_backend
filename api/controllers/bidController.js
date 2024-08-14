
import Bid from '../models/Bid.js';

export const getLiveBids = async (req, res) => {
    try {
        const liveBids = await Bid.find({});
        res.json(liveBids);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch live bids' });
    }
};
