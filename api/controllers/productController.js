import Product from '../models/product.js';

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

    // Helper function to convert time from PST/PDT to IST
    const convertToIST = (dateStr, isDaylightSaving) => {
        const date = new Date(dateStr);
        const offset = isDaylightSaving ? 12.5 * 60 * 60 * 1000 : 13.5 * 60 * 60 * 1000; // in milliseconds
        return new Date(date.getTime() + offset);
    };

    // Determine if the current time is in Daylight Saving Time (DST) or Standard Time (ST)
    const isDaylightSaving = (new Date()).getTimezoneOffset() < 60 * 8;

    // Convert current time to IST
    const currentTime = convertToIST(new Date().toISOString(), isDaylightSaving);

    // Convert bid start and end times to IST
    const bidStartTime = convertToIST(new Date(date).toISOString(), isDaylightSaving);
    const bidEndTime = convertToIST(new Date(date).toISOString(), isDaylightSaving);

    const [startHours, startMinutes] = startbidTime.split(':');
    bidStartTime.setUTCHours(parseInt(startHours, 10));
    bidStartTime.setUTCMinutes(parseInt(startMinutes, 10));

    const [endHours, endMinutes] = endbidTime.split(':');
    bidEndTime.setUTCHours(parseInt(endHours, 10));
    bidEndTime.setUTCMinutes(parseInt(endMinutes, 10));

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
        const futureBids = products.filter(product => {
            const status = determineBidStatus(product.startbidTime, product.endbidTime, product.date);
            return status === 'future';
        });
        res.status(200).json(futureBids);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Live Bids
export const getLiveBids = async (req, res) => {
    try {
        const products = await Product.find();
        const liveBids = products.filter(product => {
            const status = determineBidStatus(product.startbidTime, product.endbidTime, product.date);
            return status === 'live';
        });
        res.status(200).json(liveBids);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
