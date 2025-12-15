import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';


const router = express.Router();


router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);


export default router;