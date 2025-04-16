import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    bio: String,
    interests: [String],
    volunteeredHours: { type: Number, default: 0 },
    eventsAttended: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);