import mongoose from 'mongoose';

const { Schema } = mongoose;

const CompanySchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Company', CompanySchema);
