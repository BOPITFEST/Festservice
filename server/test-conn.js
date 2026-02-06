const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('Connection successful!');
    const [createResult] = await connection.query('CREATE TABLE IF NOT EXISTS BOP_test (id INT PRIMARY KEY)');
    console.log('Create result:', createResult);
    await connection.end();
  } catch (err) {
    console.error('ERROR MESSAGE:', err.message);
  }
}

test();
