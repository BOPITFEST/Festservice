const mysql = require('mysql2/promise');
require('dotenv').config();

async function createHistoryTable() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('Connected to MySQL. Creating History Table...');

    try {
        // Create Ticket Updates/History Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS wp_ticket_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        remarks TEXT,
        updated_by VARCHAR(100), -- Store Trigram or Name
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES wp_tickets(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

        console.log('wp_ticket_updates table created.');

    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

createHistoryTable();
