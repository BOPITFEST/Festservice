const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLocationFields() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('Connected to MySQL. Adding Location Fields...');

    try {
        // Add state, city, phone to wp_tickets
        const columns = [
            'ADD COLUMN state VARCHAR(100)',
            'ADD COLUMN city VARCHAR(100)',
            'ADD COLUMN phone VARCHAR(50)'
        ];

        for (const col of columns) {
            try {
                await connection.query(`ALTER TABLE wp_tickets ${col}`);
                console.log(`Executed: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column exists: ${col}`);
                } else {
                    console.error(`Error executing ${col}:`, e.message);
                }
            }
        }

        console.log('Schema update completed.');

    } catch (err) {
        console.error('Update failed:', err.message);
    } finally {
        await connection.end();
    }
}

addLocationFields();
