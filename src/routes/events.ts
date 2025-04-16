import express from 'express';
import { requireAuth } from '../middleware/auth';
import Event from '../models/Event';

const router = express.Router();

// CREATE: Add new event
router.post('/', requireAuth, async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            organizer: req.session.user?._id
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
    }
});

// READ: Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// READ: Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name')
            .populate('attendees', 'name');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event' });
    }
});

// UPDATE: Update event
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.session.user?._id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        Object.assign(event, req.body);
        event.updatedAt = new Date();
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
    }
});

// DELETE: Delete event
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.session.user?._id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

export default router;