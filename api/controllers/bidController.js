
import Bid from '../models/Bid.js';

export const getLiveBids = async (req, res) => {
    try {
        const liveBids = await Bid.find({});
        res.json(liveBids);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch live bids' });
    }

    
};
export const getAllBids = async (req, res) => {
    try {
        const bids = await Bid.find();  // Retrieve all bids
        res.json(bids);  // Send the bids as JSON response
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve bids', error });
    }
}