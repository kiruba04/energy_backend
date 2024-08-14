import Bid from '../models/Bid.js';
import Product from '../models/product.js';

let activeBids = {}; // Store active bids with a timer

const bidSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // Handle user joining a bid room
        socket.on('joinBid', async ({ userId, productId }) => {
            socket.join(productId);

            let bid = await Bid.findOne({ productId });

            if (!bid) {
                // Initialize a bid if it doesn't exist
                const product = await Product.findById(productId);
                if (product) {
                    bid = new Bid({
                        productId,
                        currentBid: product.price, // Start with base price
                        lastBidder: null,
                    });
                    await bid.save();
                } else {
                    socket.emit('bidError', 'Product not found.');
                    return;
                }
            }

            // Emit initial bid data
            socket.emit('bidUpdated', bid);

            // Set or reset the timer when the first user joins
            if (!activeBids[productId]) {
                activeBids[productId] = setTimeout(async () => {
                    const finalBid = await Bid.findOne({ productId });
                    io.to(productId).emit('bidEnded', { winner: finalBid?.lastBidder || 'No bids placed' });
                    delete activeBids[productId];
                }, 60000); // 1 minute timer
            }
        });

        // Handle raising a bid
        socket.on('raiseBid', async ({ userId, productId, bidAmount }) => {
            try {
                const bid = await Bid.findOne({ productId });

                if (bidAmount > bid.currentBid) {
                    // Update the bid
                    const updatedBid = await Bid.findOneAndUpdate(
                        { productId },
                        { currentBid: bidAmount, lastBidder: userId, endTime: new Date() },
                        { new: true }
                    );

                    // Clear and reset the timer
                    if (activeBids[productId]) {
                        clearTimeout(activeBids[productId]);
                    }
                    activeBids[productId] = setTimeout(async () => {
                        const finalBid = await Bid.findOne({ productId });
                        io.to(productId).emit('bidEnded', { winner: finalBid.lastBidder });
                        delete activeBids[productId];
                    }, 60000); // Reset the timer after each valid bid

                    // Emit updated bid to all users in the room
                    io.to(productId).emit('bidUpdated', updatedBid);
                } else {
                    socket.emit('bidError', 'Your bid must be higher than the current bid.');
                }
            } catch (error) {
                console.error('Error handling bid:', error);
                socket.emit('bidError', 'Error processing bid.');
            }
        });

        // Handle sending chat messages
        socket.on('sendBidMessage', ({ productId, message }) => {
            io.to(productId).emit('bidMessage', message);
        });

        // Handle user joining a bid room for chat
        socket.on('joinBidRoom', ({ productId, userId }) => {
            socket.join(productId);
            console.log(`${userId} joined chat room ${productId}`);
        });

        // Handle closing the bid manually
        socket.on('closeBid', async ({ productId }) => {
            try {
                if (activeBids[productId]) {
                    // Clear the timer and remove from active bids
                    clearTimeout(activeBids[productId]);
                    delete activeBids[productId];
        
                    // Fetch the final bid details
                    const finalBid = await Bid.findOne({ productId });
        
                    // Update the product status to 'end'
                    await Product.findByIdAndUpdate(productId, { status: 'end' });
        
                    // Emit bid ended event to all clients in the room
                    io.to(productId).emit('bidEnded', { winner: finalBid?.lastBidder || 'No bids placed' });
                }
            } catch (error) {
                console.error('Error closing bid:', error);
                socket.emit('bidError', 'Error closing the bid.');
            }
        });
        

        // Cleanup on disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};

export default bidSocket;
