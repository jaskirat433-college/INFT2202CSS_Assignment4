import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
export declare const checkAuth: (req: AuthRequest, res: Response, next: NextFunction) => any;
export {};
