const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Database Connection Pool
let pool;

async function getPool() {
    if (!pool) {
        try {
            const connectionUrl = new URL(process.env.DATABASE_URL);
            pool = mysql.createPool({
                host: connectionUrl.hostname,
                port: connectionUrl.port,
                user: connectionUrl.username,
                password: connectionUrl.password,
                database: connectionUrl.pathname.substring(1),
                ssl: {
                    rejectUnauthorized: false
                },
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });
            console.log('Database Pool Connected');
        } catch (error) {
            console.error('Database connection failed:', error.message);
            throw error;
        }
    }
    return pool;
}

// --- AUTH ROUTES ---

// Admin Login (using Trigram)
app.post('/api/auth/admin/login', async (req, res) => {
  const { trigram, password } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.execute('SELECT * FROM wp_admins WHERE trigram = ? AND password = ?', [trigram, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, trigram: rows[0].trigram, role: 'admin' } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Trigram or Password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Engineer Login (using Trigram)
app.post('/api/auth/engineer/login', async (req, res) => {
  const { trigram, password } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.execute('SELECT * FROM wp_engineers WHERE trigram = ? AND password = ?', [trigram, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, trigram: rows[0].trigram, name: rows[0].name, role: 'engineer' } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Trigram or Password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// --- TICKET ROUTES ---

// Create Ticket (Public)
app.post('/api/tickets', async (req, res) => {
  const { customerName, email, serialNumber, purchaseDate, issue } = req.body;
  try {
    const db = await getPool();
    const [result] = await db.execute(
      'INSERT INTO wp_tickets (customerName, email, serialNumber, purchaseDate, issue, status) VALUES (?, ?, ?, ?, ?, ?)',
      [customerName, email, serialNumber, purchaseDate, issue, 'Pending']
    );
    res.status(201).json({ id: result.insertId, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get All Tickets (Admin)
app.get('/api/tickets', async (req, res) => {
  try {
    const db = await getPool();
    const [tickets] = await db.execute('SELECT * FROM wp_tickets ORDER BY createdAt DESC');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Assign Ticket (Admin)
app.put('/api/tickets/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;
  try {
    const db = await getPool();
    await db.execute(
      'UPDATE wp_tickets SET assignedTo = ?, status = ? WHERE id = ?',
      [assignedTo, 'Assigned', id]
    );
    res.json({ message: 'Ticket assigned' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Complete Ticket (Engineer)
app.put('/api/tickets/:id/complete', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getPool();
    await db.execute(
      'UPDATE wp_tickets SET status = ? WHERE id = ?',
      ['Completed', id]
    );
    res.json({ message: 'Ticket completed' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Change Password (Engineer)
app.put('/api/auth/engineer/change-password', async (req, res) => {
  const { trigram, newPassword } = req.body;
  try {
    const db = await getPool();
    await db.execute(
      'UPDATE wp_engineers SET password = ? WHERE trigram = ?',
      [newPassword, trigram]
    );
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- ENGINEER ROUTES ---

// Get All Engineers
app.get('/api/engineers', async (req, res) => {
  try {
    const db = await getPool();
    const [engineers] = await db.execute('SELECT id, trigram, name, email, status, createdAt FROM wp_engineers');
    res.json(engineers);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add Engineer (Admin)
app.post('/api/engineers', async (req, res) => {
  const { name, email, trigram, password } = req.body;
  try {
    const db = await getPool();
    const [result] = await db.execute(
      'INSERT INTO wp_engineers (name, email, trigram, password, status) VALUES (?, ?, ?, ?, ?)',
      [name, email || '', trigram, password || 'password123', 'Pending']
    );
    res.status(201).json({ id: result.insertId, name, trigram, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Accept Invitation
app.post('/api/engineers/accept', async (req, res) => {
  const { trigram } = req.body;
  try {
    const db = await getPool();
    await db.execute(
      'UPDATE wp_engineers SET status = ? WHERE trigram = ?',
      ['Active', trigram]
    );
    res.json({ message: 'Invitation accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

  // --- PRODUCT MASTER ROUTES (NO LOGIC CHANGE TO EXISTING CODE) ---

  // Get Brands from view
  app.get('/api/products/brands', async (req, res) => {
    try {
      const db = await getPool();
      const [rows] = await db.execute(`
        SELECT DISTINCT brand 
        FROM FE_react_list_product
        ORDER BY brand
      `);

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  });


  // Get Families based on Brand
  app.get('/api/products/families/:brand', async (req, res) => {
    const { brand } = req.params;

    try {
      const db = await getPool();
      const [rows] = await db.execute(`
        SELECT DISTINCT family 
        FROM FE_react_list_product
        WHERE brand = ?
        ORDER BY family
      `, [brand]);

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Database error', details: err.message });
    }
  });


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
