import express from 'express';
import { createProduct, getAllProducts, deleteProduct, getProductsByCompanyId,getFutureBids,getLiveBids } from '../controllers/productController.js';

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

export default router;
