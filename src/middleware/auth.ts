import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.session.token;

        if (!token) {
            return res.status(401).redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).redirect('/login');
    }
};

export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};