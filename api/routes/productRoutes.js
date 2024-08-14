import express from 'express';
import { createProduct, getAllProducts, deleteProduct, getProductsByCompanyId,getFutureBids,getLiveBids } from '../controllers/productController.js';
import Product from '../models/product.js';

const router = express.Router();

// Route to create a product
router.post('/create', createProduct);

// Route to get all products
router.get('/all', getAllProducts);

// Route to get products by company ID
router.get('/company/:companyId', getProductsByCompanyId);

// Route to delete a product
router.delete('/:id', deleteProduct);

// Route to get live and past
router.get('/live',getLiveBids);
router.get('/future',getFutureBids);

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
