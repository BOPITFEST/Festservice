const mysql = require('mysql2/promise');
require('dotenv').config();

async function testInsert() {
    try {
        const connection = await mysql.createConnection({
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        console.log('Connected. Attempting insert...');

        const [result] = await connection.execute(
            'INSERT INTO complaints (customerName, email, phone, state, city, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                'Test Customer',
                'test@example.com',
                '1234567890',
                'Test State',
                'Test City',
                'SN12345',
                '2023-01-01',
                'Test Issue',
                'BrandX',
                'FamilyY',
                'ModelZ',
                'E001',
                '0'
            ]
        );

        console.log('Insert successful. ID:', result.insertId);

        const [rows] = await connection.execute('SELECT * FROM complaints WHERE id = ?', [result.insertId]);
        console.log('Retrieved row:', rows[0]);

        await connection.end();
    } catch (err) {
        console.error('Insert failed:', err);
    }
}

testInsert();
