import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import Database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const db = Database.getInstance();

// User validation rules
const userValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
];

// CREATE: Register new user
router.post('/users', userValidation, async (req, res) => {
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
        const result = await users.insertOne({
            email,
            password: hashedPassword,
            name,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const token = jwt.sign(
            { userId: result.insertedId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'User created successfully',
            userId: result.insertedId
        });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ message: 'Server error during user creation' });
    }
});

// READ: Get all users (admin only)
router.get('/users', requireAuth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.session.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const users = db.getDb().collection('users');
        const userList = await users.find({}, { projection: { password: 0 } }).toArray();
        res.json(userList);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// READ: Get user by ID
router.get('/users/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is requesting their own data or is admin
        if (req.session.user?._id !== id && req.session.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const users = db.getDb().collection('users');
        const user = await users.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// UPDATE: Update user
router.put('/users/:id', requireAuth, userValidation, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is updating their own data
        if (req.session.user?._id !== id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;
        const users = db.getDb().collection('users');

        // Check if new email already exists
        const existingUser = await users.findOne({ 
            email, 
            _id: { $ne: new ObjectId(id) }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const updateData: any = {
            email,
            name,
            updatedAt: new Date()
        };

        // Only update password if provided
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const result = await users.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE: Delete user
router.delete('/users/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is deleting their own account or is admin
        if (req.session.user?._id !== id && req.session.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const users = db.getDb().collection('users');
        const result = await users.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user deleted their own account, destroy session
        if (req.session.user?._id === id) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                }
            });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
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

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        req.session.token = token;
        req.session.user = { _id: user._id.toString(), email: user.email, name: user.name, role: user.role };

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
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