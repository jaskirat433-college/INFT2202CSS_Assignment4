import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';

const USER_NAME= process.env.MONGO_USER!; 
const PASSWORD= process.env.MONGO_PASSWORD!;
const DB_NAME= process.env.MONGO_NAME!;
const CLUSTER= process.env.MONGO_CLUSTER!;

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_connect';

class Database {
    private static instance: Database;
    private client: MongoClient;
    private db: Db | null = null;

    private constructor() {
        this.client = new MongoClient(MONGODB_URI);
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.db = this.client.db();
            console.log('Connected to MongoDB Atlas');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    getDb(): Db {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }
}

export default Database;