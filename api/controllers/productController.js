import Product from '../models/product.js';

// Function to convert UTC date to IST
const convertUtcToIst = (date) => {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    return new Date(date.getTime() + istOffset);
};

// Create a product
export const createProduct = async (req, res) => {
    const { type, contract, available, price, startbidTime, endbidTime, date, companyId } = req.body;
    try {
        const newProduct = new Product({
            type,
            contract,
            available,
            price,
            startbidTime,
            endbidTime,
            date,
            companyId
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Display all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('companyId', 'name'); // Assuming 'name' is a field in Company schema
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get products by company ID
export const getProductsByCompanyId = async (req, res) => {
    const companyId = req.params.companyId;

    try {
        const products = await Product.find({ companyId }).populate('companyId', 'name'); // Assuming 'name' is a field in Company schema
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Utility function to determine if a bid is live, future, or past
const determineBidStatus = (startbidTime, endbidTime, date) => {
    if (!startbidTime || !endbidTime || !date) {
        return 'unknown'; // Handle missing data
    }

    // Convert current UTC time to IST
    const currentTime = convertUtcToIst(new Date());
    
    // Use date from the database which is already in IST
    const bidStartTime = new Date(date);
    const bidEndTime = new Date(date);

    const [startHours, startMinutes] = startbidTime.split(':');
    bidStartTime.setHours(parseInt(startHours, 10));
    bidStartTime.setMinutes(parseInt(startMinutes, 10));

    const [endHours, endMinutes] = endbidTime.split(':');
    bidEndTime.setHours(parseInt(endHours, 10));
    bidEndTime.setMinutes(parseInt(endMinutes, 10));

    if (currentTime < bidStartTime) {
        return 'future';
    } else if (currentTime >= bidStartTime && currentTime <= bidEndTime) {
        return 'live';
    } else {
        return 'past'; // Optional: handle past bids
    }
};

// Get Future Bids
export const getFutureBids = async (req, res) => {
    try {
        const products = await Product.find();
        const futureBids = products.filter(product => determineBidStatus(product.startbidTime, product.endbidTime, product.date) === 'future');
        res.status(200).json(futureBids);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Live Bids
export const getLiveBids = async (req, res) => {
    try {
        const products = await Product.find();
        const liveBids = products.filter(product => determineBidStatus(product.startbidTime, product.endbidTime, product.date) === 'live');
        res.status(200).json(liveBids);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
