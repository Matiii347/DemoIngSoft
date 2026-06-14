import express from 'express';
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

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Successfully connected to database');
    release();
  }
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
