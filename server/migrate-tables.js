const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log('Starting migration to new table schema...');

    try {
        // ---------------------------------------------------------
        // 1. Create USERS table (Replaces wp_admins & wp_engineers)
        // ---------------------------------------------------------
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trigram VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        role VARCHAR(20) NOT NULL, -- 'admin' or 'engineer'
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Created users table.');

        // Migrate Admins
        try {
            await connection.query(`
        INSERT IGNORE INTO users (trigram, password, role, name, status)
        SELECT trigram, password, 'admin', 'Admin', 'Active'
        FROM wp_admins
        `);
            console.log('Admins migrated.');
        } catch (e) { console.log('Skipping admin migration (table might not exist)', e.message); }

        // Migrate Engineers
        try {
            await connection.query(`
        INSERT IGNORE INTO users (trigram, password, name, email, role, status, created_at)
        SELECT trigram, password, name, email, 'engineer', status, createdAt
        FROM wp_engineers
        `);
            console.log('Engineers migrated.');
        } catch (e) { console.log('Skipping engineer migration (table might not exist)', e.message); }


        // ---------------------------------------------------------
        // 2. Create COMPLAINTS table (Replaces wp_tickets)
        // ---------------------------------------------------------
        await connection.query(`
      CREATE TABLE IF NOT EXISTS complaints (
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
            // We first need to check column names in wp_tickets to ensure we match correctly.
            // Assuming standard columns exist.
            // We need to map assignedTo (engineer ID) to new user ID.
            // We can do this by creating a temp mapping or joining.
            // Since we can't easily do a JOIN DELETE/INSERT across tables if we are not careful about keys.

            // Simple insert first, then fix IDs.
            await connection.query(`
        INSERT IGNORE INTO complaints (id, customerName, email, phone, state, city, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode, status, assignedTo, createdAt, remarks)
        SELECT id, customerName, email, phone, state, city, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode, status, assignedTo, createdAt, remarks
        FROM wp_tickets
        `);
            console.log('Tickets migrated to complaints (with old IDs).');

            // Fix assignedTo references: Update complaints.assignedTo to match users.id where trigram matches
            // But wp_tickets.assignedTo -> wp_engineers.id
            // We need to join wp_engineers to get the trigram, then join users to get the NEW id.
            await connection.query(`
            UPDATE complaints c
            JOIN wp_engineers e ON c.assignedTo = e.id
            JOIN users u ON e.trigram = u.trigram
            SET c.assignedTo = u.id
            WHERE u.role = 'engineer'
        `);
            console.log('Fixed assignedTo references in complaints.');

        } catch (e) { console.log('Skipping tickets migration', e.message); }


        // ---------------------------------------------------------
        // 3. Create COMPLAINT_STATUS_LOGS table (Replaces wp_ticket_updates)
        // ---------------------------------------------------------
        await connection.query(`
      CREATE TABLE IF NOT EXISTS complaint_status_logs (
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
        INSERT IGNORE INTO complaint_status_logs (complaint_id, previous_status, new_status, remarks, updated_by, updated_at)
        SELECT ticket_id, previous_status, new_status, remarks, updated_by, updated_at
        FROM wp_ticket_updates
        `);
            console.log('Logs migrated.');
        } catch (e) {
            console.log('Skipping logs migration', e.message);
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
