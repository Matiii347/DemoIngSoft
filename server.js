import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Serve static files from Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Configure PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/verdemov',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Test connection and auto-initialize database
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    return;
  }
  console.log('Successfully connected to database');
  
  try {
    // Check if 'users' table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const res = await client.query(checkTableQuery);
    const tableExists = res.rows[0].exists;
    
    if (!tableExists) {
      console.log('Database tables not found. Initializing database with init.sql...');
      const sqlPath = path.join(__dirname, 'db', 'init.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      await client.query(sqlContent);
      console.log('Database successfully initialized with schema and seed data!');
    } else {
      console.log('Database tables already exist. Skipping auto-initialization.');
    }
  } catch (initErr) {
    console.error('Error during database initialization:', initErr);
  } finally {
    release();
  }
});

// Database Diagnostics Endpoint
app.get('/api/db-test', async (req, res) => {
  const status = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    envVars: Object.keys(process.env).filter(k => !k.includes('PASS') && !k.includes('KEY') && !k.includes('SECRET')),
  };

  try {
    const client = await pool.connect();
    status.connected = true;
    try {
      const dbRes = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
      status.tables = dbRes.rows.map(r => r.tablename);
      
      if (status.tables.includes('users')) {
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        status.usersCount = parseInt(userCount.rows[0].count, 10);
      }
    } catch (queryErr) {
      status.queryError = queryErr.message;
    } finally {
      client.release();
    }
  } catch (connErr) {
    status.connected = false;
    status.connectionError = connErr.message;
  }

  res.json(status);
});

// Login API Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Por favor ingresa usuario y contraseña.' });
  }

  try {
    const query = 'SELECT id, username, name, role, avatar, license_status FROM users WHERE LOWER(username) = LOWER($1) AND password = $2';
    const result = await pool.query(query, [username.trim(), password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
    }

    const user = result.rows[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role, // 'operador' or 'conductor'
        avatar: user.avatar,
        licenseStatus: user.license_status
      }
    });
  } catch (error) {
    console.error('Login database error:', error);
    res.status(500).json({ success: false, error: 'Error del servidor al iniciar sesión.' });
  }
});

// Fallback all other routes to serve the React Single Page App index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
