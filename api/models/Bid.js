import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
    productId: String,
    currentBid: Number,
    lastBidder: String,
    endTime: Date,
});

const Bid = mongoose.model('Bid', BidSchema);

export default Bid;
