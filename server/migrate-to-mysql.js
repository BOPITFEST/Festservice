const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('Connected to Production MySQL. Re-configuring for Trigram Login...');

  try {
    // 1. Admins Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wp_admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trigram VARCHAR(10) NOT NULL UNIQUE,
        email VARCHAR(191),
        password VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 2. Engineers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wp_engineers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        trigram VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191),
        password VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 3. Tickets Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wp_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customerName VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        serialNumber VARCHAR(191) NOT NULL,
        purchaseDate DATE,
        issue TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        assignedTo INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedTo) REFERENCES wp_engineers(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 4. Update existing tables if columns missing (idempotent addition)
    try { await connection.query('ALTER TABLE wp_admins ADD COLUMN trigram VARCHAR(10) UNIQUE AFTER id'); } catch(e) {}
    try { await connection.query('ALTER TABLE wp_engineers ADD COLUMN trigram VARCHAR(10) UNIQUE AFTER id'); } catch(e) {}

    console.log('Tables re-configured.');

    // 5. Initial Data with Trigrams
    // Default Admin
    await connection.query(`
      INSERT INTO wp_admins (trigram, email, password) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE trigram=VALUES(trigram)
    `, ['ADM', 'admin@warranty.com', 'admin123']);

    // Default Engineers
    await connection.query(`
      INSERT INTO wp_engineers (trigram, name, email, password, status) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE trigram=VALUES(trigram)
    `, ['ALI', 'Alice Engineer', 'alice@tech.com', 'eng123', 'Active']);

    await connection.query(`
      INSERT INTO wp_engineers (trigram, name, email, password, status) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE trigram=VALUES(trigram)
    `, ['BOB', 'Bob Support', 'bob@tech.com', 'eng123', 'Active']);

    console.log('Trigram data initialized: ADM, ALI, BOB');
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await connection.end();
  }
}

migrate();
