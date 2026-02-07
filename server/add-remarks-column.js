const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('Connected to MySQL. Updating Schema...');

  try {
    // Add remarks column to wp_tickets
    console.log('Adding remarks column if not exists...');
    try {
      await connection.query('ALTER TABLE wp_tickets ADD COLUMN remarks TEXT');
      console.log('Added remarks column.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Remarks column already exists.');
      } else {
        console.error('Error adding remarks column:', e.message);
      }
    }

    // Update existing statuses to new numeric scheme (Optional, but good for consistency)
    // 0 - Pending/Creation
    // 5 - Assigned
    // 50 - Completed
    console.log('Migrating old status values...');
    await connection.query("UPDATE wp_tickets SET status = '0' WHERE status = 'Pending'");
    await connection.query("UPDATE wp_tickets SET status = '5' WHERE status = 'Assigned'");
    await connection.query("UPDATE wp_tickets SET status = '50' WHERE status = 'Completed'");
    
    console.log('Schema update and data migration completed.');

  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    await connection.end();
  }
}

updateSchema();
