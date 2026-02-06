const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'warranty.db');
const db = new Database(dbPath);

// Initialize Tables
function initDB() {
  // Admins Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `).run();

  // Engineers Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS engineers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Tickets Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      email TEXT NOT NULL,
      serialNumber TEXT NOT NULL,
      purchaseDate TEXT,
      issue TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      assignedTo INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES engineers(id)
    )
  `).run();

  // Initial Data
  const adminCheck = db.prepare('SELECT count(*) as count FROM admins').get();
  if (adminCheck.count === 0) {
    db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)').run('admin@warranty.com', 'admin123');
    console.log('Default Admin created: admin@warranty.com / admin123');
  }

  const engineerCheck = db.prepare('SELECT count(*) as count FROM engineers').get();
  if (engineerCheck.count === 0) {
    db.prepare('INSERT INTO engineers (name, email, password, status) VALUES (?, ?, ?, ?)')
      .run('Alice Engineer', 'alice@tech.com', 'eng123', 'Active');
    db.prepare('INSERT INTO engineers (name, email, password, status) VALUES (?, ?, ?, ?)')
      .run('Bob Support', 'bob@tech.com', 'eng123', 'Active');
    console.log('Dummy Engineers created.');
  }

  console.log('SQLite Database Initialized at:', dbPath);
}

initDB();

module.exports = db;
