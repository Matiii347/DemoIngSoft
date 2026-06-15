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

    // Check if 'system_settings' table exists
    const checkSettingsTable = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_settings'
      );
    `;
    const settingsRes = await client.query(checkSettingsTable);
    const settingsExists = settingsRes.rows[0].exists;
    
    if (!settingsExists) {
      console.log('Creating system_settings table...');
      await client.query(`
        CREATE TABLE system_settings (
          key VARCHAR(50) PRIMARY KEY,
          value VARCHAR(50) NOT NULL
        );
        INSERT INTO system_settings (key, value) VALUES
        ('alert_red', '15'),
        ('alert_yellow', '30'),
        ('alert_green', '60');
      `);
      console.log('system_settings table created successfully!');
    }
  } catch (initErr) {
    console.error('Error during database initialization:', initErr);
  } finally {
    release();
  }
});

// GET /api/settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM system_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = parseInt(row.value, 10);
    });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Error al obtener configuraciones.' });
  }
});

// PUT /api/settings
app.put('/api/settings', async (req, res) => {
  const { alert_red, alert_yellow, alert_green } = req.body;
  try {
    await pool.query("UPDATE system_settings SET value = $1 WHERE key = 'alert_red'", [alert_red]);
    await pool.query("UPDATE system_settings SET value = $1 WHERE key = 'alert_yellow'", [alert_yellow]);
    await pool.query("UPDATE system_settings SET value = $1 WHERE key = 'alert_green'", [alert_green]);
    res.json({ success: true, message: 'Configuraciones actualizadas.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar configuraciones.' });
  }
});

// GET /api/drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, name, password, role, avatar, license_status AS \"licenseStatus\" FROM users WHERE role = 'conductor' ORDER BY id ASC");
    res.json({ success: true, drivers: result.rows });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, error: 'Error al obtener choferes.' });
  }
});

// POST /api/drivers
app.post('/api/drivers', async (req, res) => {
  const { name, username, password, licenseStatus, avatar } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, username, password, role, license_status, avatar) VALUES ($1, $2, $3, 'conductor', $4, $5) RETURNING id, username, name, password, role, avatar, license_status AS \"licenseStatus\"",
      [name, username, password, licenseStatus, avatar]
    );
    res.status(201).json({ success: true, driver: result.rows[0] });
  } catch (error) {
    console.error('Error creating driver:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya existe.' });
    }
    res.status(500).json({ success: false, error: 'Error al crear chofer.' });
  }
});

// PUT /api/drivers/:id
app.put('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, password, licenseStatus, avatar } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, username = $2, password = $3, license_status = $4, avatar = $5 WHERE id = $6 RETURNING id, username, name, password, role, avatar, license_status AS "licenseStatus"',
      [name, username, password, licenseStatus, avatar, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Chofer no encontrado.' });
    }
    res.json({ success: true, driver: result.rows[0] });
  } catch (error) {
    console.error('Error updating driver:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya existe.' });
    }
    res.status(500).json({ success: false, error: 'Error al actualizar chofer.' });
  }
});

// DELETE /api/drivers/:id
app.delete('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Chofer no encontrado.' });
    }
    res.json({ success: true, id: parseInt(id, 10) });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar chofer.' });
  }
});

// GET /api/vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.id, 
        v.model, 
        v.status, 
        v.battery, 
        v.driver_id AS "driverId", 
        u.name AS "driver", 
        u.avatar AS "driverImage",
        v.cargo_limit AS "cargoLimit", 
        v.current_cargo AS "currentCargo", 
        v.range_left AS "rangeLeft", 
        v.current_location AS "currentLocation",
        TO_CHAR(v.vtv_expiration, 'YYYY-MM-DD') AS "vtvExpiration"
      FROM vehicles v
      LEFT JOIN users u ON v.driver_id = u.id
      ORDER BY v.id ASC
    `;
    const result = await pool.query(query);
    
    const vehicles = result.rows.map(v => ({
      ...v,
      battery: parseInt(v.battery, 10),
      cargoLimit: parseFloat(v.cargoLimit),
      currentCargo: parseFloat(v.currentCargo),
      rangeLeft: parseInt(v.rangeLeft, 10),
      driverId: v.driverId ? parseInt(v.driverId, 10) : null
    }));
    
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: 'Error al obtener vehículos.' });
  }
});

// POST /api/vehicles
app.post('/api/vehicles', async (req, res) => {
  const { id, model, status, battery, driverId, cargoLimit, currentCargo, rangeLeft, currentLocation, vtvExpiration } = req.body;
  try {
    const query = `
      INSERT INTO vehicles (id, model, status, battery, driver_id, cargo_limit, current_cargo, range_left, current_location, vtv_expiration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    await pool.query(query, [
      id.trim().toUpperCase(), 
      model, 
      status || 'En Ruta', 
      battery || 100, 
      driverId || null, 
      cargoLimit || 4.5, 
      currentCargo || 0.0, 
      rangeLeft || 400, 
      currentLocation || '', 
      vtvExpiration || null
    ]);
    
    const fetchQuery = `
      SELECT 
        v.id, 
        v.model, 
        v.status, 
        v.battery, 
        v.driver_id AS "driverId", 
        u.name AS "driver", 
        u.avatar AS "driverImage",
        v.cargo_limit AS "cargoLimit", 
        v.current_cargo AS "currentCargo", 
        v.range_left AS "rangeLeft", 
        v.current_location AS "currentLocation",
        TO_CHAR(v.vtv_expiration, 'YYYY-MM-DD') AS "vtvExpiration"
      FROM vehicles v
      LEFT JOIN users u ON v.driver_id = u.id
      WHERE v.id = $1
    `;
    const result = await pool.query(fetchQuery, [id.trim().toUpperCase()]);
    const vehicle = {
      ...result.rows[0],
      battery: parseInt(result.rows[0].battery, 10),
      cargoLimit: parseFloat(result.rows[0].cargoLimit),
      currentCargo: parseFloat(result.rows[0].currentCargo),
      rangeLeft: parseInt(result.rows[0].rangeLeft, 10),
      driverId: result.rows[0].driverId ? parseInt(result.rows[0].driverId, 10) : null
    };
    
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ success: false, error: 'El ID de vehículo ya existe.' });
    }
    res.status(500).json({ success: false, error: 'Error al crear vehículo.' });
  }
});

// PUT /api/vehicles/:id
app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { model, status, battery, driverId, cargoLimit, currentCargo, rangeLeft, currentLocation, vtvExpiration } = req.body;
  try {
    const query = `
      UPDATE vehicles 
      SET model = $1, status = $2, battery = $3, driver_id = $4, cargo_limit = $5, current_cargo = $6, range_left = $7, current_location = $8, vtv_expiration = $9
      WHERE id = $10
      RETURNING id
    `;
    const updateResult = await pool.query(query, [
      model, 
      status, 
      battery, 
      driverId || null, 
      cargoLimit, 
      currentCargo, 
      rangeLeft, 
      currentLocation, 
      vtvExpiration || null, 
      id
    ]);
    
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado.' });
    }
    
    const fetchQuery = `
      SELECT 
        v.id, 
        v.model, 
        v.status, 
        v.battery, 
        v.driver_id AS "driverId", 
        u.name AS "driver", 
        u.avatar AS "driverImage",
        v.cargo_limit AS "cargoLimit", 
        v.current_cargo AS "currentCargo", 
        v.range_left AS "rangeLeft", 
        v.current_location AS "currentLocation",
        TO_CHAR(v.vtv_expiration, 'YYYY-MM-DD') AS "vtvExpiration"
      FROM vehicles v
      LEFT JOIN users u ON v.driver_id = u.id
      WHERE v.id = $1
    `;
    const result = await pool.query(fetchQuery, [id]);
    const vehicle = {
      ...result.rows[0],
      battery: parseInt(result.rows[0].battery, 10),
      cargoLimit: parseFloat(result.rows[0].cargoLimit),
      currentCargo: parseFloat(result.rows[0].currentCargo),
      rangeLeft: parseInt(result.rows[0].rangeLeft, 10),
      driverId: result.rows[0].driverId ? parseInt(result.rows[0].driverId, 10) : null
    };
    
    res.json({ success: true, vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar vehículo.' });
  }
});

// DELETE /api/vehicles/:id
app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado.' });
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar vehículo.' });
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
