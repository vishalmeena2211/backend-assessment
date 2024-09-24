import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const generateAccessToken = (user: any) => {
    return jwt.sign(user, process.env.JWT_ACESS_SECRET || "", { expiresIn: '15m' });
};

const generateRefreshToken = (user: any) => {
    return jwt.sign(user, process.env.JWT_REFRESH_SECRET || "", { expiresIn: '7d' });
};

export const signup = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: 'User registered successfully', user });

    } catch (error) {
        res.status(500).json({ error: 'User registration failed', message: error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', path: '/' });

        res.status(200).json({ message: 'Logged in successfully', accessToken });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_FORGOT_PASSWORD || "", { expiresIn: '2m' });

        // Send email with reset link (using nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=${token}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send password reset email' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(403).json({ error: 'Refresh token is required' });
    }

    try {
        // Verify if the refresh token is valid and exists in the database
        const storedToken = await prisma.refreshToken.findUnique({
            //@ts-ignore
            where: { token: refreshToken },
        });

        if (!storedToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Verify the token using JWT
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "", (err: any, user: any) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid refresh token' });
            }

            // Generate a new access token
            const accessToken = generateAccessToken({ id: user.id, email: user.email, name: user.name });

            res.status(200).json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ error: 'Token refresh failed' });
    }
};


export const logout = async (req: Request, res: Response) => {
    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(204).send();  // No content, user is already logged out
    }

    try {
        // Remove the refresh token from the database
        await prisma.refreshToken.delete({
            //@ts-ignore
            where: { token: refreshToken },
        });

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
};
