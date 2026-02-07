const mysql = require('mysql2/promise');
require('dotenv').config();

async function verify() {
    try {
        const connection = await mysql.createConnection({
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        console.log('Connected.');

        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        try {
            const [complaints] = await connection.query('DESCRIBE complaints');
            console.log('Complaints columns:', complaints.map(c => c.Field));
        } catch (e) { console.log('Error describing complaints:', e.message); }

        try {
            const [users] = await connection.query('DESCRIBE users');
            console.log('Users columns:', users.map(u => u.Field));
        } catch (e) { console.log('Error describing users:', e.message); }

        // Check row counts
        try {
            const [uCount] = await connection.query('SELECT count(*) as c FROM users');
            console.log('Users count:', uCount[0].c);
        } catch (e) { }

        try {
            const [cCount] = await connection.query('SELECT count(*) as c FROM complaints');
            console.log('Complaints count:', cCount[0].c);
        } catch (e) { }

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

verify();
