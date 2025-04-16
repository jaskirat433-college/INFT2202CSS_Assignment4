import express from 'express';
import { requireAuth } from '../middleware/auth';
import Post from '../models/Post';

const router = express.Router();

// CREATE: Add new post
router.post('/', requireAuth, async (req, res) => {
    try {
        const post = new Post({
            ...req.body,
            author: req.session.user?._id
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post' });
    }
});

// READ: Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// UPDATE: Update post
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.session.user?._id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        Object.assign(post, req.body);
        post.updatedAt = new Date();
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post' });
    }
});

// DELETE: Delete post
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.session.user?._id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Comments
router.post('/:id/comments', requireAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            content: req.body.content,
            author: req.session.user?._id
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment' });
    }
});

export default router;