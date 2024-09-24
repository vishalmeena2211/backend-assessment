import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for validating query parameters for getting all users
const getAllUsersSchema = z.object({
    query: z.object({
        page: z.string().optional().transform((val) => parseInt(val || '1'))
    })
});

// Controller to get all users with pagination
export const getAllUsers = async (req: Request, res: Response) => {
    const validation = getAllUsersSchema.safeParse(req);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const page = validation.data.query.page || 1;
    const usersPerPage = 10;

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true, 
                createdAt: true,
                updatedAt: true
            },
            take: usersPerPage,
            skip: (page - 1) * usersPerPage
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Schema for validating request parameters for getting a user by ID
const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});

// Controller to get a user by ID
export const getUserById = async (req: Request, res: Response) => {
    const validation = getUserByIdSchema.safeParse(req);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { id } = validation.data.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Schema for validating request parameters and body for updating a user
const updateUserSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        name: z.string().min(1),
        email: z.string().email()
    })
});

// Controller to update a user by ID
export const updateUser = async (req: Request, res: Response) => {
    const validation = updateUserSchema.safeParse(req);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { id } = validation.data.params;
    const { name, email } = validation.data.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { name, email },
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Schema for validating request parameters for deleting a user
const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});

// Controller to delete a user by ID
export const deleteUser = async (req: Request, res: Response) => {
    const validation = deleteUserSchema.safeParse(req);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
    }

    const { id } = validation.data.params;
    try {
        await prisma.user.delete({
            where: { id: id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};