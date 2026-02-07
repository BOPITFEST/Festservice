const mysql = require('mysql2/promise');
require('dotenv').config();

async function productionReset() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true
    });

    console.log('--- PRODUCTION DATABASE RESET INITIATED ---');

    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // List tables to drop
        const tablesToDrop = [
            'complaint_status_logs',
            'complaints',
            'users',
            'wp_admins',
            'wp_engineers',
            'wp_tickets',
            'wp_ticket_updates'
        ];

        for (const table of tablesToDrop) {
            await connection.query(`DROP TABLE IF EXISTS ${table}`);
            console.log(`Dropped ${table} (if it existed).`);
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create Users Table
        await connection.query(`
          CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            trigram VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100),
            email VARCHAR(100),
            role VARCHAR(20) NOT NULL,
            role_id INT NOT NULL,
            status VARCHAR(20) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Created users table.');

        // Insert Default Admin
        await connection.query(`
          INSERT INTO users (trigram, password, name, role, role_id, status)
          VALUES ('ADMIN', 'festservice2025', 'Super Administrator', 'admin', 10, 'Active')
        `);
        console.log('Inserted default admin (Trigram: ADMIN, Password: festservice2025).');

        // Create Complaints Table
        await connection.query(`
          CREATE TABLE complaints (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customerName VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            state VARCHAR(50),
            city VARCHAR(50),
            serialNumber VARCHAR(50) NOT NULL,
            purchaseDate DATE,
            issue TEXT NOT NULL,
            brand VARCHAR(50),
            family VARCHAR(50),
            modelNumber VARCHAR(50),
            errorCode VARCHAR(50),
            status VARCHAR(20) DEFAULT '0',
            assignedTo INT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            remarks TEXT,
            FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
          )
        `);
        console.log('Created complaints table.');

        // Create Logs Table
        await connection.query(`
          CREATE TABLE complaint_status_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            complaint_id INT NOT NULL,
            previous_status VARCHAR(50),
            new_status VARCHAR(50) NOT NULL,
            remarks TEXT,
            updated_by VARCHAR(100),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
          )
        `);
        console.log('Created complaint_status_logs table.');

        console.log('--- DATABASE SUCCESSFULLY WIPED AND READY FOR PRODUCTION ---');

    } catch (err) {
        console.error('Reset failed:', err);
    } finally {
        await connection.end();
    }
}

productionReset();
