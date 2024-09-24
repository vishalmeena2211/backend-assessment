import express from 'express';
import { Request, Response } from 'express';
import { forgotPassword, login, logout, refreshAccessToken, resetPassword, signup } from '../controllers/authController';
import { deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/userController';
import { authenticateToken, isAdmin, isUser } from '../middlewares/auth';
const rateLimit = require('express-rate-limit');

const senstiveRoutes = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: 'Too many attemptes',
});

const router = express.Router();

// Authentication Routes
router.post('/auth/login', senstiveRoutes, login);

router.post('/auth/signup', signup);

router.post('/auth/forgot-password', forgotPassword);

router.post('/auth/reset-password', senstiveRoutes, resetPassword);

router.post('/auth/logout', authenticateToken, logout);

router.get('/auth/refresh-token', refreshAccessToken);

//user get,update and delete rouutes
router.get('/users', authenticateToken, isAdmin, getAllUsers);

router.get('/users/:id', isUser, getUserById);

router.put('/users/:id', isUser, updateUser);

router.delete('/users/:id', isAdmin, deleteUser);

export default router;