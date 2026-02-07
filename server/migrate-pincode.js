const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('Migrating Complaints table: city -> pincode...');

    try {
        // Change column city to pincode VARCHAR(6)
        await connection.query('ALTER TABLE complaints CHANGE city pincode VARCHAR(6)');
        console.log('Successfully replaced city with pincode VARCHAR(6).');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
