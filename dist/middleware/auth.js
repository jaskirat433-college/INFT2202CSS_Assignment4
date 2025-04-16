import jwt from 'jsonwebtoken';
export const requireAuth = async (req, res, next) => {
    try {
        const token = req.session.token;
        if (!token) {
            return res.status(401).redirect('/login');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).redirect('/login');
    }
};
export const checkAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};
//# sourceMappingURL=auth.js.map