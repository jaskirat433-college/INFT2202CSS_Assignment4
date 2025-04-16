import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();
const db = Database.getInstance();
// Registration validation
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
];
// Registration route
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, name } = req.body;
        const users = db.getDb().collection('users');
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await users.insertOne({
            email,
            password: hashedPassword,
            name,
            createdAt: new Date()
        });
        const token = jwt.sign({ userId: user.insertedId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        req.session.token = token;
        req.session.user = { email, name };
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});
// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = db.getDb().collection('users');
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        req.session.token = token;
        req.session.user = { email: user.email, name: user.name };
        res.json({ message: 'Login successful' });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
// Protected routes
router.get('/protected', requireAuth, (req, res) => {
    res.json({ message: 'Protected route accessed successfully' });
});
// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});
export default router;
//# sourceMappingURL=api.js.map