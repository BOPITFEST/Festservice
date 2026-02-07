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

// Unified Login Route
app.post('/api/auth/login', async (req, res) => {
  const { trigram, password } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.execute('SELECT * FROM users WHERE trigram = ? AND password = ?', [trigram, password]);
    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          trigram: user.trigram,
          name: user.name,
          role: user.role,
          role_id: user.role_id
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Trigram or Password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Admin Login (Legacy - keeping for compatibility during migration if needed)
app.post('/api/auth/admin/login', async (req, res) => {
  const { trigram, password } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.execute('SELECT * FROM users WHERE trigram = ? AND password = ? AND role_id = 10', [trigram, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, trigram: rows[0].trigram, role: 'admin', role_id: 10 } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Trigram or Password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Engineer Login (Legacy)
app.post('/api/auth/engineer/login', async (req, res) => {
  const { trigram, password } = req.body;
  try {
    const db = await getPool();
    const [rows] = await db.execute('SELECT * FROM users WHERE trigram = ? AND password = ? AND role_id = 5', [trigram, password]);
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, trigram: rows[0].trigram, name: rows[0].name, role: 'engineer', role_id: 5 } });
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
  const { customerName, email, phone, state, pincode, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode } = req.body;
  try {
    const db = await getPool();
    // Use fallback for optional fields if not present in older clients
    const [result] = await db.execute(
      'INSERT INTO complaints (customerName, email, phone, state, pincode, serialNumber, purchaseDate, issue, brand, family, modelNumber, errorCode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        customerName,
        email,
        phone || '',
        state || '',
        pincode || '',
        serialNumber,
        purchaseDate,
        issue,
        brand || '',
        family || '',
        modelNumber || '',
        errorCode || '',
        '0'
      ] // Status 0 = Creation
    );
    res.status(201).json({ id: result.insertId, status: '0' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get States (For Filter)
app.get('/api/tickets/states', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.execute('SELECT DISTINCT state FROM complaints WHERE state IS NOT NULL AND state != "" ORDER BY state');
    res.json(rows.map(r => r.state));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get All Tickets (Admin)
app.get('/api/tickets', async (req, res) => {
  try {
    const db = await getPool();
    const [tickets] = await db.execute('SELECT *, createdAt as createdAt FROM complaints ORDER BY createdAt DESC');
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

    // Get current status and engineer details for logging
    const [currentTicket] = await db.execute('SELECT status FROM complaints WHERE id = ?', [id]);
    const previousStatus = currentTicket[0] ? currentTicket[0].status : 'Unknown';

    await db.execute(
      'UPDATE complaints SET assignedTo = ?, status = ? WHERE id = ?',
      [assignedTo, '5', id]
    );

    // Log to history
    await db.execute(
      'INSERT INTO complaint_status_logs (complaint_id, previous_status, new_status, remarks, updated_by) VALUES (?, ?, ?, ?, ?)',
      [id, previousStatus, '5', 'Assigned to Engineer', 'Admin']
    );

    res.json({ message: 'Ticket assigned', status: '5' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update Ticket Status & Remarks (Engineer)
app.put('/api/tickets/:id/update', async (req, res) => {
  const { id } = req.params;
  const { status, remarks, updatedBy } = req.body; // updatedBy should be sent from frontend (Trigram)
  try {
    const db = await getPool();

    // Get previous status
    const [currentTicket] = await db.execute('SELECT status FROM complaints WHERE id = ?', [id]);
    const previousStatus = currentTicket[0] ? currentTicket[0].status : 'Unknown';

    // Use provided remarks or default to 'Status updated'
    const finalRemarks = remarks && remarks.trim() !== '' ? remarks : 'Status updated';

    await db.execute(
      'UPDATE complaints SET status = ?, remarks = ? WHERE id = ?',
      [status, finalRemarks, id]
    );

    // Log to history
    await db.execute(
      'INSERT INTO complaint_status_logs (complaint_id, previous_status, new_status, remarks, updated_by) VALUES (?, ?, ?, ?, ?)',
      [id, previousStatus, status, finalRemarks, updatedBy || 'Engineer']
    );

    res.json({ message: 'Ticket updated', status, remarks: finalRemarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Ticket History
app.get('/api/tickets/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getPool();
    const [history] = await db.execute(
      'SELECT *, updated_at as updated_at FROM complaint_status_logs WHERE complaint_id = ? ORDER BY updated_at DESC',
      [id]
    );
    res.json(history);
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
      'UPDATE users SET password = ? WHERE trigram = ?',
      [newPassword, trigram]
    );
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- ENGINEER ROUTES ---

// Get All Staff (Admins and Engineers)
app.get('/api/engineers', async (req, res) => {
  try {
    const db = await getPool();
    const [staff] = await db.execute('SELECT id, trigram, name, email, status, role, role_id, created_at as createdAt FROM users');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add Staff Member (Admin)
app.post('/api/engineers', async (req, res) => {
  const { name, email, trigram, password, role } = req.body;
  const roleId = role === 'admin' ? 10 : 5;
  const finalRole = role === 'admin' ? 'admin' : 'engineer';

  try {
    const db = await getPool();
    const [result] = await db.execute(
      'INSERT INTO users (name, email, trigram, password, status, role, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email || '', trigram, password || 'password123', 'Pending', finalRole, roleId]
    );
    res.status(201).json({ id: result.insertId, name, trigram, status: 'Pending', role: finalRole, role_id: roleId });
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
      'UPDATE users SET status = ? WHERE trigram = ?',
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

// Get Models based on Brand and Family
app.get('/api/products/models/:brand/:family', async (req, res) => {
  const { brand, family } = req.params;
  try {
    const db = await getPool();
    const [rows] = await db.execute(`
        SELECT DISTINCT mn 
        FROM FE_react_list_product
        WHERE brand = ? AND family = ?
        ORDER BY mn
      `, [brand, family]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
