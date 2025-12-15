import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js';


const router = express.Router();


router.post('/', auth, createProduct);
router.get('/', auth, getProducts);
router.get('/:id', auth, getProductById);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);


export default router;