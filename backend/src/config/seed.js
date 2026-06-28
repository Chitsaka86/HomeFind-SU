import pool from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
    try {
        console.log(' Seeding database...');
        
        const schemaPath = path.join(__dirname, '../../../homefind_su_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        
        await pool.query(schema);
        console.log(' Database schema executed successfully!');
        
        console.log(' Database seeded successfully!');
        await pool.end();
    } catch (error) {
        console.error(' Seed failed:', error.message);
        await pool.end();
    }
}

seedDatabase();