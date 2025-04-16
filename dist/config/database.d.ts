import { Db } from 'mongodb';
declare class Database {
    private static instance;
    private client;
    private db;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    getDb(): Db;
}
export default Database;
