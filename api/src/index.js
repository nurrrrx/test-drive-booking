// src/index.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with improved error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection when the app starts
(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Log sanitized connection string (hiding password)
    const sanitizedUrl = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : 
      'No DATABASE_URL provided';
    console.error('Connection string:', sanitizedUrl);
  }
})();

// Error handling for unexpected database disconnections
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // Don't exit in production, as the connection might recover
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Database initialization
async function initDb() {
  let client;
  try {
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        booking_date DATE NOT NULL,
        time_slot TEXT NOT NULL,
        car TEXT NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (client) client.release();
  }
}

// Initialize database on startup
initDb().catch(console.error);

// Simple test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes

// Get all bookings with optional date filter
app.get('/api/bookings', async (req, res) => {
  let client;
  try {
    const { date } = req.query;
    let query = 'SELECT * FROM bookings';
    let values = [];
    
    if (date) {
      query += ' WHERE booking_date = $1';
      values = [date];
    }
    
    query += ' ORDER BY time_slot';
    
    client = await pool.connect();
    const result = await client.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (client) client.release();
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  let client;
  try {
    const { customerName, phoneNumber, date, timeSlot, car, location } = req.body;
    
    // Validate required fields
    if (!customerName || !phoneNumber || !date || !timeSlot || !car) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    client = await pool.connect();
    const result = await client.query(
      'INSERT INTO bookings (customer_name, phone_number, booking_date, time_slot, car, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customerName, phoneNumber, date, timeSlot, car, location || '']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (client) client.release();
  }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    client = await pool.connect();
    const result = await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (client) client.release();
  }
});

// Delete a booking (optional endpoint)
app.delete('/api/bookings/:id', async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    
    client = await pool.connect();
    const result = await client.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    if (client) client.release();
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  pool.end();
  process.exit(0);
});