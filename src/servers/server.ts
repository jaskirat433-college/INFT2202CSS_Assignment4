import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import eventRoutes from '../routes/events';
import postRoutes from '../routes/posts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'volunteer_connect_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Configure static file serving
const rootDir = path.join(__dirname, '../../');

// Serve static files with correct paths
app.use(express.static(rootDir));
app.use('/src', express.static(path.join(rootDir, 'src')));
app.use('/dist', express.static(path.join(rootDir, 'dist')));
app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/assets', express.static(path.join(rootDir, 'assets')));
app.use('/node_modules', express.static(path.join(rootDir, 'node_modules')));

// Add MIME type handling
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/volunteer_connect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', require('../routes/api'));

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});