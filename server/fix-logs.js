const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixLogs() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('Connected. Fixing logs...');

    try {
        // Insert logs only for existing complaints
        const [result] = await connection.query(`
        INSERT INTO complaint_status_logs (complaint_id, previous_status, new_status, remarks, updated_by, updated_at)
        SELECT u.ticket_id, u.previous_status, u.new_status, u.remarks, u.updated_by, u.updated_at
        FROM wp_ticket_updates u
        JOIN complaints c ON u.ticket_id = c.id
    `);
        console.log(`Logs migrated successfully: ${result.affectedRows} rows.`);

    } catch (err) {
        console.error('Log migration failed:', err);
    } finally {
        await connection.end();
    }
}

fixLogs();
