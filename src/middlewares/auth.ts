import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface User extends Request {
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export const authenticateToken = (req: User, res: Response, next: NextFunction) => {
    // Get token from headers 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_ACESS_SECRET || "", (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired access token' });
        }

        // Attach user to request object
        req.user = user;

        next();
    });
};


export const isAdmin = (req: User, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not logged in' });
    }

    if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    next();
};

export const isUser = (req: User, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User not logged in' });
    }

    if (user.role !== 'USER' && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Users or Admins only' });
    }

    next(); // User is a USER or ADMIN, proceed to the next middleware or route handler
};
