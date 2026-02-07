const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('--- wp_admins ---');
    try {
        const [rows] = await connection.query('DESCRIBE wp_admins');
        rows.forEach(r => console.log(`${r.Field}: ${r.Type} ${r.Null === 'NO' ? 'NOT NULL' : ''} ${r.Key}`));
    } catch (e) { console.log('Error:', e.message); }

    console.log('\n--- wp_engineers ---');
    try {
        const [rows] = await connection.query('DESCRIBE wp_engineers');
        rows.forEach(r => console.log(`${r.Field}: ${r.Type} ${r.Null === 'NO' ? 'NOT NULL' : ''} ${r.Key}`));
    } catch (e) { console.log('Error:', e.message); }

    console.log('\n--- users ---');
    try {
        const [rows] = await connection.query('DESCRIBE users');
        rows.forEach(r => console.log(`${r.Field}: ${r.Type} ${r.Null === 'NO' ? 'NOT NULL' : ''} ${r.Key}`));
    } catch (e) { console.log('Error:', e.message); }

    await connection.end();
}

checkSchema();
