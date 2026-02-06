const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  console.log('Connected to database. Initializing tables...');

  // Simplest possible table to see if it even creates
  await connection.query(`
    CREATE TABLE IF NOT EXISTS warranty_engineers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      email VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS warranty_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customerName VARCHAR(50) NOT NULL,
      email VARCHAR(50) NOT NULL,
      serialNumber VARCHAR(50) NOT NULL,
      purchaseDate DATE,
      issue TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      assignedTo INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Tables initialized successfully.');
  await connection.end();
}

initDB().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
