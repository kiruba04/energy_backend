import mongoose from 'mongoose';
import Company from './Company.js'; 

const { Schema } = mongoose;

const ProductSchema = new mongoose.Schema({
    type: { type: String, required: true },
    contract: { type: String, required: true },
    available: { type: String, required: true },
    price: { type: Number, required: true },
    startbidTime: { type: String, required: true }, // e.g., '09:00 AM'
    endbidTime: { type: String, required: true }, // e.g., '05:00 PM'
    status: { type: String, default: 'notstart' },
    date: { type: Date, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // Reference to the Company model
}, { timestamps: true });


export default mongoose.model('Product', ProductSchema);
