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
      console.log('Database tables already exist. Checking for data consistency and constraints...');
      // 1. Resolve seed duplicates: unassign VM-042 if it's assigned to 'chofer' alongside VM-018
      await client.query(`
        UPDATE vehicles 
        SET driver_id = NULL 
        WHERE id = 'VM-042' 
          AND driver_id = (SELECT id FROM users WHERE username = 'chofer');
      `);

      // 1b. Update gerente user profile to Kamala Harris
      await client.query(`
        UPDATE users 
        SET name = 'Kamala Harris',
            avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
        WHERE username = 'gerente';
      `);
      
      // 2. Add UNIQUE constraint to vehicles.driver_id if it doesn't exist
      try {
        await client.query(`
          ALTER TABLE vehicles ADD CONSTRAINT vehicles_driver_id_key UNIQUE (driver_id);
        `);
        console.log('Successfully enforced UNIQUE constraint on vehicles.driver_id.');
      } catch (constraintErr) {
        // Constraint already exists, which is fine
      }

      // 3. Add expenses columns to trips table if they do not exist
      try {
        await client.query(`
          ALTER TABLE trips ADD COLUMN IF NOT EXISTS expenses_amount NUMERIC(10,2) DEFAULT 0.00;
          ALTER TABLE trips ADD COLUMN IF NOT EXISTS expenses_detail TEXT;
        `);
        console.log('Successfully enforced schema migration for trips table (expenses columns).');
      } catch (tripsErr) {
        console.error('Error migrating trips table:', tripsErr);
      }

      // 4. Update check constraint on vehicles.status to include 'En Mantenimiento'
      try {
        await client.query(`
          ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
          ALTER TABLE vehicles ADD CONSTRAINT vehicles_status_check CHECK (status IN ('En Ruta', 'Cargando', 'Crítico', 'En Mantenimiento'));
        `);
        console.log('Successfully updated vehicles_status_check constraint to include En Mantenimiento.');
      } catch (checkErr) {
        console.error('Error updating status check constraint:', checkErr);
      }

      // 5. Add kilometers column to vehicles table if it doesn't exist
      try {
        await client.query(`
          ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS kilometers NUMERIC(10,2) DEFAULT 0.00;
        `);
        console.log('Successfully enforced schema migration for vehicles table (kilometers column).');
      } catch (kmErr) {
        console.error('Error migrating vehicles table (kilometers):', kmErr);
      }

      // 6. Clean up roles and update check constraint to only support 'operador' and 'conductor'
      try {
        // First delete users that are not 'operador' or 'conductor', or operators that are not 'gerente'
        await client.query(`
          DELETE FROM users 
          WHERE role NOT IN ('operador', 'conductor') 
             OR (role = 'operador' AND username != 'gerente');
        `);
        
        await client.query(`
          ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
          ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('operador', 'conductor'));
        `);
        console.log('Successfully cleaned up non-conforming users and enforced role check constraint (operador, conductor).');
      } catch (roleErr) {
        console.error('Error updating role check constraint:', roleErr);
      }

      // 7. Bulk seed users if total drivers < 80
      try {
        const driverCountRes = await client.query("SELECT COUNT(*) FROM users WHERE role = 'conductor'");
        const count = parseInt(driverCountRes.rows[0].count, 10);
        if (count < 80) {
          console.log(`Only ${count} drivers found. Seeding up to 80 drivers...`);
          await client.query(`
            INSERT INTO users (username, password, name, role, avatar, license_status) VALUES
            ('ch_martinez','ch123','Roberto Martínez','conductor',NULL,'Vigente'),
            ('ch_lopez','ch123','María López','conductor',NULL,'Vigente'),
            ('ch_gonzalez','ch123','Pedro González','conductor',NULL,'Vigente'),
            ('ch_herrera','ch123','Claudia Herrera','conductor',NULL,'Vigente'),
            ('ch_romero','ch123','Fabián Romero','conductor',NULL,'Vigente'),
            ('ch_jimenez','ch123','Laura Jiménez','conductor',NULL,'Renovación Requerida'),
            ('ch_moreno','ch123','Sergio Moreno','conductor',NULL,'Vigente'),
            ('ch_nunez','ch123','Alejandra Núñez','conductor',NULL,'Vigente'),
            ('ch_alvarez','ch123','Javier Álvarez','conductor',NULL,'Vigente'),
            ('ch_ruiz','ch123','Mónica Ruiz','conductor',NULL,'Vigente'),
            ('ch_diaz','ch123','Hernán Díaz','conductor',NULL,'Vigente'),
            ('ch_perez','ch123','Silvina Pérez','conductor',NULL,'Vigente'),
            ('ch_sanchez','ch123','Ariel Sánchez','conductor',NULL,'Vigente'),
            ('ch_castro','ch123','Graciela Castro','conductor',NULL,'Vencida'),
            ('ch_ortega','ch123','Emilio Ortega','conductor',NULL,'Vigente'),
            ('ch_ramos','ch123','Natalia Ramos','conductor',NULL,'Vigente'),
            ('ch_vargas','ch123','Omar Vargas','conductor',NULL,'Vigente'),
            ('ch_guerrero','ch123','Stella Guerrero','conductor',NULL,'Vigente'),
            ('ch_navarro','ch123','Claudio Navarro','conductor',NULL,'Vigente'),
            ('ch_medina','ch123','Rosa Medina','conductor',NULL,'Vigente'),
            ('ch_aguilar','ch123','Daniel Aguilar','conductor',NULL,'Vigente'),
            ('ch_rios','ch123','Verónica Ríos','conductor',NULL,'Vigente'),
            ('ch_ponce','ch123','Cristian Ponce','conductor',NULL,'Vigente'),
            ('ch_cabrera','ch123','Analía Cabrera','conductor',NULL,'Vigente'),
            ('ch_fuentes','ch123','Marcelo Fuentes','conductor',NULL,'Vigente'),
            ('ch_delgado','ch123','Viviana Delgado','conductor',NULL,'Vigente'),
            ('ch_moran','ch123','Eduardo Morán','conductor',NULL,'Renovación Requerida'),
            ('ch_sosa','ch123','Lorena Sosa','conductor',NULL,'Vigente'),
            ('ch_ibarra','ch123','Matías Ibarra','conductor',NULL,'Vigente'),
            ('ch_bravo','ch123','Susana Bravo','conductor',NULL,'Vigente'),
            ('ch_lara','ch123','Gonzalo Lara','conductor',NULL,'Vigente'),
            ('ch_urena','ch123','Patricia Ureña','conductor',NULL,'Vigente'),
            ('ch_barrera','ch123','Rodrigo Barrera','conductor',NULL,'Vigente'),
            ('ch_acosta','ch123','Beatriz Acosta','conductor',NULL,'Vigente'),
            ('ch_espinoza','ch123','Rubén Espinoza','conductor',NULL,'Vigente'),
            ('ch_pena','ch123','Cecilia Peña','conductor',NULL,'Vigente'),
            ('ch_contreras','ch123','Germán Contreras','conductor',NULL,'Vigente'),
            ('ch_zamora','ch123','Andrea Zamora','conductor',NULL,'Vigente'),
            ('ch_tapia','ch123','Roberto Tapia','conductor',NULL,'Vigente'),
            ('ch_miranda','ch123','Florencia Miranda','conductor',NULL,'Vigente'),
            ('ch_bermudez','ch123','Pablo Bermúdez','conductor',NULL,'Vigente'),
            ('ch_nieto','ch123','Adriana Nieto','conductor',NULL,'Vigente'),
            ('ch_serrano','ch123','Walter Serrano','conductor',NULL,'Vigente'),
            ('ch_sandoval','ch123','Carolina Sandoval','conductor',NULL,'Vigente'),
            ('ch_montoya','ch123','Eugenio Montoya','conductor',NULL,'Vigente'),
            ('ch_vega2','ch123','Miriam Vega','conductor',NULL,'Vigente'),
            ('ch_mendoza2','ch123','Diego Mendoza','conductor',NULL,'Vigente'),
            ('ch_duarte','ch123','Alejandro Duarte','conductor',NULL,'Vigente'),
            ('ch_vera','ch123','Silvana Vera','conductor',NULL,'Vigente'),
            ('ch_campos','ch123','Marcos Campos','conductor',NULL,'Vigente'),
            ('ch_paredes','ch123','Daniela Paredes','conductor',NULL,'Vigente'),
            ('ch_molina2','ch123','Gustavo Molina','conductor',NULL,'Vigente'),
            ('ch_arce','ch123','Nora Arce','conductor',NULL,'Vigente'),
            ('ch_pineda','ch123','Francisco Pineda','conductor',NULL,'Vigente'),
            ('ch_rangel','ch123','Liliana Rangel','conductor',NULL,'Vigente'),
            ('ch_santiago','ch123','Héctor Santiago','conductor',NULL,'Vigente'),
            ('ch_arrieta','ch123','Nadia Arrieta','conductor',NULL,'Vigente'),
            ('ch_blanco','ch123','Osvaldo Blanco','conductor',NULL,'Vigente'),
            ('ch_coronel','ch123','Flavia Coronel','conductor',NULL,'Vigente'),
            ('ch_rojas','ch123','Ignacio Rojas','conductor',NULL,'Vigente'),
            ('ch_paz','ch123','Elisa Paz','conductor',NULL,'Vencida'),
            ('ch_ocampo','ch123','Ramiro Ocampo','conductor',NULL,'Vigente'),
            ('ch_aguirre','ch123','Karina Aguirre','conductor',NULL,'Vigente'),
            ('ch_gaitan','ch123','Mauricio Gaitán','conductor',NULL,'Vigente'),
            ('ch_olvera','ch123','Natalia Olvera','conductor',NULL,'Vigente'),
            ('ch_reina','ch123','Simón Reina','conductor',NULL,'Vigente'),
            ('ch_vergara','ch123','Paola Vergara','conductor',NULL,'Vigente'),
            ('ch_escobar','ch123','Jonatan Escobar','conductor',NULL,'Vigente'),
            ('ch_tovar','ch123','Mercedes Tovar','conductor',NULL,'Vigente'),
            ('ch_montes','ch123','César Montes','conductor',NULL,'Vigente'),
            ('ch_quispe','ch123','Irene Quispe','conductor',NULL,'Vigente'),
            ('ch_naranjo','ch123','Maximiliano Naranjo','conductor',NULL,'Vigente'),
            ('ch_zapata','ch123','Lorenza Zapata','conductor',NULL,'Vigente'),
            ('ch_cano','ch123','Leandro Cano','conductor',NULL,'Vigente'),
            ('ch_rendon','ch123','Amanda Rendón','conductor',NULL,'Vigente'),
            ('ch_pacheco','ch123','Humberto Pacheco','conductor',NULL,'Vigente'),
            ('ch_vidal','ch123','Guillermo Vidal','conductor',NULL,'Vigente')
            ON CONFLICT (username) DO NOTHING;
          `);
          console.log('Bulk seed of 80 drivers completed.');
        }
      } catch (seedErr) {
        console.error('Error during bulk user seed:', seedErr);
      }
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

    // Migration: route_templates table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS route_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          origin VARCHAR(100) NOT NULL,
          destination VARCHAR(100) NOT NULL,
          total_distance NUMERIC(6,2) NOT NULL,
          estimated_time VARCHAR(20),
          stops_json TEXT,
          task_description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      // Seed a few starter templates if empty
      const rtCount = await client.query('SELECT COUNT(*) FROM route_templates');
      if (parseInt(rtCount.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO route_templates (name, origin, destination, total_distance, estimated_time, stops_json, task_description) VALUES
          ('CABA → Lanús', 'Base Operativa Buenos Aires', 'Depósito Lanús', 45.0, '1h 10m', '[]', 'Descarga de mercadería y firma de remito'),
          ('CABA → Quilmes', 'Base Operativa Buenos Aires', 'Centro Distribución Quilmes', 38.0, '55m', '[]', 'Entrega y descarga completa'),
          ('CABA → La Plata', 'Base Operativa Buenos Aires', 'Terminal La Plata', 68.0, '1h 45m', '["Parada CD Norte", "Carga Rápida YPF"]', 'Entrega programada con firma digital');
        `);
      }
      console.log('route_templates table ready.');
    } catch (rtErr) {
      console.error('Error migrating route_templates:', rtErr);
    }

    // Migration: maintenances table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS maintenances (
          id SERIAL PRIMARY KEY,
          vehicle_id VARCHAR(20) REFERENCES vehicles(id) ON DELETE CASCADE,
          maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
          maintenance_type VARCHAR(80) NOT NULL,
          cost NUMERIC(10,2) DEFAULT 0.00,
          parts_used TEXT,
          workshop VARCHAR(100),
          notes TEXT
        );
      `);
      console.log('maintenances table ready.');
    } catch (maintErr) {
      console.error('Error migrating maintenances:', maintErr);
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

// GET /api/users — lista todos los usuarios (opcionalmente filtra por role)
app.get('/api/users', async (req, res) => {
  const { role } = req.query;
  try {
    let query = 'SELECT id, username, name, password, role, avatar, license_status AS "licenseStatus" FROM users';
    const params = [];
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    query += ' ORDER BY role ASC, name ASC';
    const result = await pool.query(query, params);
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Error al obtener usuarios.' });
  }
});

// POST /api/users — crea cualquier tipo de usuario
app.post('/api/users', async (req, res) => {
  const { name, username, password, role, licenseStatus, avatar } = req.body;
  const validRoles = ['operador', 'conductor'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'Rol no válido.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (name, username, password, role, license_status, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, name, password, role, avatar, license_status AS "licenseStatus"',
      [name, username, password, role, licenseStatus || 'Vigente', avatar || null]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya existe.' });
    }
    res.status(500).json({ success: false, error: 'Error al crear usuario.' });
  }
});

// PUT /api/users/:id — edita cualquier usuario
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role, licenseStatus, avatar } = req.body;
  const validRoles = ['operador', 'conductor'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'Rol no válido.' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET name=$1, username=$2, password=$3, role=$4, license_status=$5, avatar=$6 WHERE id=$7 RETURNING id, username, name, password, role, avatar, license_status AS "licenseStatus"',
      [name, username, password, role, licenseStatus || 'Vigente', avatar || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya existe.' });
    }
    res.status(500).json({ success: false, error: 'Error al actualizar usuario.' });
  }
});

// DELETE /api/users/:id — elimina cualquier usuario
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }
    res.json({ success: true, id: parseInt(id, 10) });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar usuario.' });
  }
});

// GET /api/drivers — alias que mantiene compatibilidad retroactiva
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
        v.kilometers,
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
      kilometers: parseFloat(v.kilometers || 0),
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
  const { id, model, status, battery, driverId, cargoLimit, currentCargo, rangeLeft, currentLocation, vtvExpiration, kilometers } = req.body;
  try {
    if (driverId) {
      const duplicateCheck = await pool.query('SELECT id FROM vehicles WHERE driver_id = $1', [driverId]);
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({ success: false, error: `El chofer seleccionado ya está asignado al vehículo ${duplicateCheck.rows[0].id}.` });
      }
    }
    const query = `
      INSERT INTO vehicles (id, model, status, battery, driver_id, cargo_limit, current_cargo, range_left, current_location, vtv_expiration, kilometers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      vtvExpiration || null,
      kilometers ? parseFloat(kilometers) : 0.00
    ]);
    
    const fetchQuery = `
      SELECT 
        v.id, 
        v.model, 
        v.status, 
        v.battery, 
        v.kilometers,
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
      kilometers: parseFloat(result.rows[0].kilometers || 0),
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
  const { model, status, battery, driverId, cargoLimit, currentCargo, rangeLeft, currentLocation, vtvExpiration, kilometers } = req.body;
  try {
    if (driverId) {
      const duplicateCheck = await pool.query('SELECT id FROM vehicles WHERE driver_id = $1 AND id != $2', [driverId, id]);
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({ success: false, error: `El chofer seleccionado ya está asignado al vehículo ${duplicateCheck.rows[0].id}.` });
      }
    }
    const query = `
      UPDATE vehicles 
      SET model = $1, status = $2, battery = $3, driver_id = $4, cargo_limit = $5, current_cargo = $6, range_left = $7, current_location = $8, vtv_expiration = $9, kilometers = $10
      WHERE id = $11
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
      kilometers ? parseFloat(kilometers) : 0.00,
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
        v.kilometers,
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
      kilometers: parseFloat(result.rows[0].kilometers || 0),
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

// GET /api/trips
app.get('/api/trips', async (req, res) => {
  const { driverId } = req.query;
  try {
    let query = `
      SELECT 
        t.id, 
        t.driver_id AS "driverId", 
        t.vehicle_id AS "vehicleId", 
        TO_CHAR(t.trip_date, 'YYYY-MM-DD') AS "tripDate", 
        t.status, 
        t.total_distance AS "totalDistance", 
        t.estimated_time AS "estimatedTime", 
        t.total_stops AS "totalStops",
        t.expenses_amount AS "expensesAmount",
        t.expenses_detail AS "expensesDetail"
      FROM trips t
    `;
    const params = [];
    if (driverId) {
      query += ' WHERE t.driver_id = $1';
      params.push(parseInt(driverId, 10));
    }
    query += ' ORDER BY t.trip_date DESC, t.id DESC';
    
    const result = await pool.query(query, params);
    
    const trips = result.rows.map(t => ({
      ...t,
      expensesAmount: parseFloat(t.expensesAmount || 0),
      totalDistance: parseFloat(t.totalDistance || 0)
    }));
    
    res.json({ success: true, trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ success: false, error: 'Error al obtener hojas de ruta.' });
  }
});

// POST /api/trips
app.post('/api/trips', async (req, res) => {
  const { driverId, vehicleId, tripDate, totalDistance, estimatedTime, origin, destination, taskDescription, stops } = req.body;
  
  if (!driverId || !vehicleId || !totalDistance || !origin || !destination) {
    return res.status(400).json({ success: false, error: 'Por favor completa todos los campos requeridos.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if driver already has an active trip in progress
    const activeCheck = await client.query("SELECT id FROM trips WHERE driver_id = $1 AND status = 'En Progreso'", [driverId]);
    if (activeCheck.rows.length > 0) {
      throw new Error('El chofer ya tiene una Hoja de Ruta en progreso activa.');
    }

    // 2. Insert trip
    const totalStopsCount = 2 + (stops && Array.isArray(stops) ? stops.length : 0);
    const tripQuery = `
      INSERT INTO trips (driver_id, vehicle_id, trip_date, status, total_distance, estimated_time, total_stops)
      VALUES ($1, $2, $3, 'En Progreso', $4, $5, $6)
      RETURNING id
    `;
    const tripResult = await client.query(tripQuery, [
      parseInt(driverId, 10),
      vehicleId,
      tripDate || new Date(),
      parseFloat(totalDistance),
      estimatedTime || 'N/A',
      totalStopsCount
    ]);
    const tripId = tripResult.rows[0].id;

    // 3. Insert Stop 1 (Origen)
    const distToNext = stops && stops.length > 0 ? parseFloat(totalDistance) / (stops.length + 1) : parseFloat(totalDistance);
    const stop1Query = `
      INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next)
      VALUES ($1, 1, $2, 'Origen', 'Completado', 'Salida: 08:00', $3)
    `;
    await client.query(stop1Query, [tripId, origin, distToNext]);

    // 4. Insert intermediate stops if any
    let currentOrder = 2;
    if (stops && Array.isArray(stops)) {
      for (const stopName of stops) {
        const intermediateStopQuery = `
          INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next)
          VALUES ($1, $2, $3, 'Intermedio', 'Planificado', 'Parada programada', $4)
        `;
        await client.query(intermediateStopQuery, [tripId, currentOrder, stopName, distToNext]);
        currentOrder++;
      }
    }

    // 5. Insert final Stop (Destino)
    const finalStopQuery = `
      INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next)
      VALUES ($1, $2, $3, 'Destino', 'Siguiente', 'Entrega programada', 0)
      RETURNING id
    `;
    const finalStopResult = await client.query(finalStopQuery, [tripId, currentOrder, destination]);
    const finalStopId = finalStopResult.rows[0].id;

    // 6. Insert Task for final stop
    if (taskDescription && taskDescription.trim()) {
      const taskQuery = `
        INSERT INTO stop_tasks (stop_id, description, done)
        VALUES ($1, $2, FALSE)
      `;
      await client.query(taskQuery, [finalStopId, taskDescription.trim()]);
    } else {
      // Default tasks
      const taskQuery = `
        INSERT INTO stop_tasks (stop_id, description, done)
        VALUES ($1, 'Descarga de mercadería', FALSE), ($1, 'Firma de remito', FALSE)
      `;
      await client.query(taskQuery, [finalStopId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, tripId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating trip:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al registrar la hoja de ruta.' });
  } finally {
    client.release();
  }
});

// GET /api/trips/active
app.get('/api/trips/active', async (req, res) => {
  const { driverId } = req.query;
  if (!driverId) {
    return res.status(400).json({ success: false, error: 'driverId es requerido.' });
  }
  try {
    const query = `
      SELECT 
        t.id, 
        t.driver_id AS "driverId", 
        t.vehicle_id AS "vehicleId", 
        TO_CHAR(t.trip_date, 'YYYY-MM-DD') AS "tripDate", 
        t.status, 
        t.total_distance AS "totalDistance", 
        t.estimated_time AS "estimatedTime", 
        t.total_stops AS "totalStops"
      FROM trips t
      WHERE t.driver_id = $1 AND t.status = 'En Progreso'
      ORDER BY t.id DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [parseInt(driverId, 10)]);
    
    if (result.rows.length === 0) {
      return res.json({ success: true, activeTrip: null });
    }
    
    const activeTrip = result.rows[0];
    
    // Fetch stops
    const stopsQuery = `
      SELECT id, stop_order AS "stopOrder", name, stop_type AS "stopType", status, details, distance_to_next AS "distanceToNext"
      FROM stops
      WHERE trip_id = $1
      ORDER BY stop_order ASC
    `;
    const stopsResult = await pool.query(stopsQuery, [activeTrip.id]);
    activeTrip.stops = stopsResult.rows.map(s => ({
      ...s,
      distanceToNext: parseFloat(s.distanceToNext || 0)
    }));
    
    // Fetch tasks
    for (let stop of activeTrip.stops) {
      const tasksQuery = `
        SELECT id, description, done
        FROM stop_tasks
        WHERE stop_id = $1
        ORDER BY id ASC
      `;
      const tasksResult = await pool.query(tasksQuery, [stop.id]);
      stop.tasks = tasksResult.rows;
    }
    
    res.json({ success: true, activeTrip });
  } catch (error) {
    console.error('Error fetching active trip:', error);
    res.status(500).json({ success: false, error: 'Error al obtener hoja de ruta activa.' });
  }
});

// PUT /api/trips/:id/complete
app.put('/api/trips/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { expensesAmount, expensesDetail, finalKm } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Get original trip details to know the vehicle and driver
    const tripQuery = `
      SELECT t.vehicle_id, t.driver_id, u.name AS driver_name
      FROM trips t
      JOIN users u ON t.driver_id = u.id
      WHERE t.id = $1
    `;
    const tripRes = await client.query(tripQuery, [parseInt(id, 10)]);
    if (tripRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Hoja de ruta no encontrada.' });
    }
    const { vehicle_id, driver_id, driver_name } = tripRes.rows[0];
    const distToUse = finalKm ? parseFloat(finalKm) : 0;
    
    // 2. Update trip status, expenses and distance
    const updateTripQuery = `
      UPDATE trips 
      SET status = 'Completado',
          expenses_amount = $1,
          expenses_detail = $2,
          total_distance = $3
      WHERE id = $4
    `;
    await client.query(updateTripQuery, [
      parseFloat(expensesAmount || 0),
      expensesDetail || '',
      distToUse,
      parseInt(id, 10)
    ]);
    
    // 3. Update vehicle's kilometers
    const updateVehicleQuery = `
      UPDATE vehicles
      SET kilometers = kilometers + $1
      WHERE id = $2
    `;
    await client.query(updateVehicleQuery, [distToUse, vehicle_id]);
    
    // 4. Create database notification/alert
    const insertAlertQuery = `
      INSERT INTO alerts (vehicle_id, title, description, severity, status)
      VALUES ($1, $2, $3, 'info', 'Activa')
    `;
    const alertTitle = `Ruta Finalizada (${vehicle_id})`;
    const alertDesc = `El chofer ${driver_name} completó la ruta. Distancia: ${distToUse} km. Gastos: $${parseFloat(expensesAmount || 0).toLocaleString('es-AR')} (${expensesDetail || 'Sin detalle'}).`;
    await client.query(insertAlertQuery, [vehicle_id, alertTitle, alertDesc]);
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Hoja de ruta completada, kilómetros registrados y alerta creada.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error completing trip:', error);
    res.status(500).json({ success: false, error: 'Error al completar la hoja de ruta.' });
  } finally {
    client.release();
  }
});

// GET /api/alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, vehicle_id AS "vehicleId", title, description, severity, status FROM alerts ORDER BY id DESC');
    res.json({ success: true, alerts: result.rows });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Error al obtener alertas.' });
  }
});

// DELETE /api/alerts/:id
app.delete('/api/alerts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING id', [parseInt(id, 10)]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alerta no encontrada.' });
    }
    res.json({ success: true, message: 'Alerta descartada con éxito.' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ success: false, error: 'Error al descartar la alerta.' });
  }
});

// PUT /api/tasks/:id/toggle
app.put('/api/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  try {
    await pool.query('UPDATE stop_tasks SET done = $1 WHERE id = $2', [done, parseInt(id, 10)]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar tarea.' });
  }
});

// ─── ROUTE TEMPLATES ───────────────────────────────────────────────────────

// GET /api/route-templates
app.get('/api/route-templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM route_templates ORDER BY name ASC');
    const templates = result.rows.map(t => ({
      id: t.id,
      name: t.name,
      origin: t.origin,
      destination: t.destination,
      totalDistance: parseFloat(t.total_distance),
      estimatedTime: t.estimated_time,
      stops: t.stops_json ? JSON.parse(t.stops_json) : [],
      taskDescription: t.task_description
    }));
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching route templates:', error);
    res.status(500).json({ success: false, error: 'Error al obtener plantillas.' });
  }
});

// POST /api/route-templates
app.post('/api/route-templates', async (req, res) => {
  const { name, origin, destination, totalDistance, estimatedTime, stops, taskDescription } = req.body;
  if (!name || !origin || !destination || !totalDistance) {
    return res.status(400).json({ success: false, error: 'Nombre, origen, destino y distancia son requeridos.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO route_templates (name, origin, destination, total_distance, estimated_time, stops_json, task_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, origin, destination, parseFloat(totalDistance), estimatedTime || '', JSON.stringify(stops || []), taskDescription || '']
    );
    const t = result.rows[0];
    res.status(201).json({ success: true, template: {
      id: t.id, name: t.name, origin: t.origin, destination: t.destination,
      totalDistance: parseFloat(t.total_distance), estimatedTime: t.estimated_time,
      stops: t.stops_json ? JSON.parse(t.stops_json) : [], taskDescription: t.task_description
    }});
  } catch (error) {
    console.error('Error creating route template:', error);
    res.status(500).json({ success: false, error: 'Error al crear plantilla.' });
  }
});

// PUT /api/route-templates/:id
app.put('/api/route-templates/:id', async (req, res) => {
  const { id } = req.params;
  const { name, origin, destination, totalDistance, estimatedTime, stops, taskDescription } = req.body;
  try {
    const result = await pool.query(
      `UPDATE route_templates SET name=$1, origin=$2, destination=$3, total_distance=$4, estimated_time=$5, stops_json=$6, task_description=$7
       WHERE id=$8 RETURNING *`,
      [name, origin, destination, parseFloat(totalDistance), estimatedTime || '', JSON.stringify(stops || []), taskDescription || '', parseInt(id,10)]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Plantilla no encontrada.' });
    const t = result.rows[0];
    res.json({ success: true, template: {
      id: t.id, name: t.name, origin: t.origin, destination: t.destination,
      totalDistance: parseFloat(t.total_distance), estimatedTime: t.estimated_time,
      stops: t.stops_json ? JSON.parse(t.stops_json) : [], taskDescription: t.task_description
    }});
  } catch (error) {
    console.error('Error updating route template:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar plantilla.' });
  }
});

// DELETE /api/route-templates/:id
app.delete('/api/route-templates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM route_templates WHERE id=$1 RETURNING id', [parseInt(id,10)]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Plantilla no encontrada.' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting route template:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar plantilla.' });
  }
});

// ─── VEHICLE HISTORY & MAINTENANCES ─────────────────────────────────────────

// GET /api/vehicles/:id/history
app.get('/api/vehicles/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    // Completed trips for this vehicle
    const tripsRes = await pool.query(`
      SELECT t.id, TO_CHAR(t.trip_date,'YYYY-MM-DD') AS "tripDate", t.status,
             t.total_distance AS "totalDistance", t.expenses_amount AS "expensesAmount",
             t.expenses_detail AS "expensesDetail", u.name AS "driverName"
      FROM trips t
      LEFT JOIN users u ON t.driver_id = u.id
      WHERE t.vehicle_id = $1
      ORDER BY t.trip_date DESC, t.id DESC
    `, [id]);

    // Maintenances for this vehicle
    const maintRes = await pool.query(`
      SELECT id, TO_CHAR(maintenance_date,'YYYY-MM-DD') AS "maintenanceDate",
             maintenance_type AS "maintenanceType", cost, parts_used AS "partsUsed",
             workshop, notes
      FROM maintenances
      WHERE vehicle_id = $1
      ORDER BY maintenance_date DESC
    `, [id]);

    // Alerts for this vehicle
    const alertsRes = await pool.query(`
      SELECT id, title, description, severity, status
      FROM alerts WHERE vehicle_id = $1 ORDER BY id DESC
    `, [id]);

    res.json({
      success: true,
      trips: tripsRes.rows.map(t => ({
        ...t,
        totalDistance: parseFloat(t.totalDistance || 0),
        expensesAmount: parseFloat(t.expensesAmount || 0)
      })),
      maintenances: maintRes.rows.map(m => ({ ...m, cost: parseFloat(m.cost || 0) })),
      alerts: alertsRes.rows
    });
  } catch (error) {
    console.error('Error fetching vehicle history:', error);
    res.status(500).json({ success: false, error: 'Error al obtener historial del vehículo.' });
  }
});

// GET /api/vehicles/:id/maintenances
app.get('/api/vehicles/:id/maintenances', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT id, TO_CHAR(maintenance_date,'YYYY-MM-DD') AS "maintenanceDate",
             maintenance_type AS "maintenanceType", cost, parts_used AS "partsUsed",
             workshop, notes
      FROM maintenances WHERE vehicle_id=$1 ORDER BY maintenance_date DESC
    `, [id]);
    res.json({ success: true, maintenances: result.rows.map(m => ({ ...m, cost: parseFloat(m.cost || 0) })) });
  } catch (error) {
    console.error('Error fetching maintenances:', error);
    res.status(500).json({ success: false, error: 'Error al obtener mantenimientos.' });
  }
});

// POST /api/vehicles/:id/maintenances
app.post('/api/vehicles/:id/maintenances', async (req, res) => {
  const { id } = req.params;
  const { maintenanceDate, maintenanceType, cost, partsUsed, workshop, notes } = req.body;
  if (!maintenanceType) {
    return res.status(400).json({ success: false, error: 'El tipo de mantenimiento es requerido.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO maintenances (vehicle_id, maintenance_date, maintenance_type, cost, parts_used, workshop, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, TO_CHAR(maintenance_date,'YYYY-MM-DD') AS "maintenanceDate",
                 maintenance_type AS "maintenanceType", cost, parts_used AS "partsUsed", workshop, notes`,
      [id, maintenanceDate || new Date(), maintenanceType, parseFloat(cost || 0), partsUsed || '', workshop || '', notes || '']
    );
    const m = result.rows[0];
    res.status(201).json({ success: true, maintenance: { ...m, cost: parseFloat(m.cost || 0) } });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ success: false, error: 'Error al registrar mantenimiento.' });
  }
});

// DELETE /api/vehicles/:id/maintenances/:maintId
app.delete('/api/vehicles/:id/maintenances/:maintId', async (req, res) => {
  const { maintId } = req.params;
  try {
    await pool.query('DELETE FROM maintenances WHERE id=$1', [parseInt(maintId,10)]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar mantenimiento.' });
  }
});

// Fallback all other routes to serve the React Single Page App index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
