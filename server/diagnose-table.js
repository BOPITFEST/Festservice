const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnose() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const [cols] = await connection.query('SHOW COLUMNS FROM complaints');
    console.log('--- COMPLAINTS COLUMNS ---');
    cols.forEach(c => console.log(c.Field));
    console.log('-------------------------');

    await connection.end();
}

diagnose();
