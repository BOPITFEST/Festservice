const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAndMigrate() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true // Enable multiple statements for FK disable
    });

    console.log('Connected. Resetting and migrating tables (OFF FK CHECKS)...');

    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 1. DROP NEW TABLES TO ENSURE FRESH SCHEMA
        await connection.query('DROP TABLE IF EXISTS complaint_status_logs');
        await connection.query('DROP TABLE IF EXISTS complaints');
        await connection.query('DROP TABLE IF EXISTS users');

        // Also drop potential conflicting tables if they exist and are not needed (User only listed the 3 replacements)
        // But be careful.

        console.log('Dropped existing new tables.');

        // Enabling FK checks is usually good practice, but for Create statements it doesn't matter much if we define constraints inline.
        // However, we should re-enable it.
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');


        // 2. CREATE USERS
        await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trigram VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        role VARCHAR(20) NOT NULL, -- 'admin' or 'engineer'
        role_id INT NOT NULL, -- 10 for admin, 5 for engineer
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Created users table.');

        // Migrate Admins
        try {
            await connection.query(`
        INSERT INTO users (trigram, password, role, role_id, name, status)
        SELECT trigram, password, 'admin', 10, 'Admin', 'Active'
        FROM wp_admins
        `);
            console.log('Admins migrated.');
        } catch (e) { console.log('Admin migration note:', e.message); }

        // Migrate Engineers
        try {
            await connection.query(`
        INSERT INTO users (trigram, password, name, email, role, role_id, status, created_at)
        SELECT trigram, password, name, email, 'engineer', 5, status, createdAt
        FROM wp_engineers
        `);
            console.log('Engineers migrated.');
        } catch (e) { console.log('Engineer migration note:', e.message); }


        // 3. CREATE COMPLAINTS
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

        // Migrate Tickets
        try {
            await connection.query(`
        INSERT INTO complaints (id, customerName, email, phone, state, city, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode, status, assignedTo, createdAt, remarks)
        SELECT id, customerName, email, phone, state, city, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode, status, assignedTo, createdAt, remarks
        FROM wp_tickets
        `);
            console.log('Tickets migrated.');

            // Fix references
            await connection.query(`
            UPDATE complaints c
            JOIN wp_engineers e ON c.assignedTo = e.id
            JOIN users u ON e.trigram = u.trigram
            SET c.assignedTo = u.id
            WHERE u.role = 'engineer'
        `);
            console.log('Fixed assignedTo references.');
        } catch (e) { console.log('Ticket migration note:', e.message); }


        // 4. CREATE LOGS
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

        try {
            await connection.query(`
        INSERT INTO complaint_status_logs (complaint_id, previous_status, new_status, remarks, updated_by, updated_at)
        SELECT ticket_id, previous_status, new_status, remarks, updated_by, updated_at
        FROM wp_ticket_updates
        `);
            console.log('Logs migrated.');
        } catch (e) {
            console.log('Logs migration note:', e.message);
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

resetAndMigrate();
