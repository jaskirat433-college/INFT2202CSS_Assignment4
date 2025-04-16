import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_connect';
class Database {
    constructor() {
        this.db = null;
        this.client = new MongoClient(MONGODB_URI);
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db();
            console.log('Connected to MongoDB Atlas');
        }
        catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }
    getDb() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }
}
export default Database;
//# sourceMappingURL=database.js.map