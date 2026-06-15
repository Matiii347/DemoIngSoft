-- VerdeMov Database Initialization Script
-- PostgreSQL Schema and Seed Data (v2 - 120 users)

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS stop_tasks CASCADE;
DROP TABLE IF EXISTS stops CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('operador', 'conductor', 'taller', 'administrativo')),
    avatar TEXT,
    license_status VARCHAR(50) DEFAULT 'Vigente'
);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    id VARCHAR(20) PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('En Ruta', 'Cargando', 'Crítico', 'En Mantenimiento')),
    battery INTEGER NOT NULL CHECK (battery >= 0 AND battery <= 100),
    kilometers NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    driver_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    cargo_limit NUMERIC(5,2) NOT NULL,
    current_cargo NUMERIC(5,2) NOT NULL,
    range_left INTEGER NOT NULL,
    current_location TEXT,
    vtv_expiration DATE
);

-- 3. Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(20) REFERENCES vehicles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
    status VARCHAR(50) DEFAULT 'Activa'
);

-- 4. Trips Table (Routes)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id VARCHAR(20) REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Planificado', 'En Progreso', 'Completado')),
    total_distance NUMERIC(6,2) NOT NULL,
    estimated_time VARCHAR(20),
    total_stops INTEGER NOT NULL DEFAULT 0,
    expenses_amount NUMERIC(10,2) DEFAULT 0.00,
    expenses_detail TEXT
);

-- 5. Stops Table (Timeline of a trip)
CREATE TABLE stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('Origen', 'Intermedio', 'Carga', 'Destino')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Planificado', 'Siguiente', 'Completado')),
    details TEXT,
    distance_to_next NUMERIC(6,2),
    UNIQUE (trip_id, stop_order)
);

-- 6. Stop Tasks Table
CREATE TABLE stop_tasks (
    id SERIAL PRIMARY KEY,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- ─── OPERADORES / USUARIOS DE FLOTA (10) ─────────────────────
INSERT INTO users (username, password, name, role, avatar, license_status) VALUES
('gerente',     'gerente123',  'Kamala Harris',       'operador', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150', 'Vigente'),
('op_rodriguez','op123',       'Rodrigo Rodríguez',   'operador', NULL, 'Vigente'),
('op_fernandez','op123',       'Marcela Fernández',   'operador', NULL, 'Vigente'),
('op_suarez',   'op123',       'Esteban Suárez',      'operador', NULL, 'Vigente'),
('op_luna',     'op123',       'Patricia Luna',       'operador', NULL, 'Vigente'),
('op_torres',   'op123',       'Gustavo Torres',      'operador', NULL, 'Vigente'),
('op_vega',     'op123',       'Sandra Vega',         'operador', NULL, 'Vigente'),
('op_molina',   'op123',       'Diego Molina',        'operador', NULL, 'Vigente'),
('op_reyes',    'op123',       'Valeria Reyes',       'operador', NULL, 'Vigente'),
('op_peralta',  'op123',       'Nicolás Peralta',     'operador', NULL, 'Vigente');

-- ─── CHOFERES / CONDUCTORES (80) ─────────────────────────────
INSERT INTO users (username, password, name, role, avatar, license_status) VALUES
('chofer',        'chofer123', 'Carlos Mendoza',      'conductor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', 'Renovación Requerida'),
('ana',           'ana123',    'Ana Silva',            'conductor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 'Vigente'),
('luis',          'luis123',   'Luis García',          'conductor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', 'Vigente'),
('ch_martinez',   'ch123',     'Roberto Martínez',    'conductor', NULL, 'Vigente'),
('ch_lopez',      'ch123',     'María López',          'conductor', NULL, 'Vigente'),
('ch_gonzalez',   'ch123',     'Pedro González',      'conductor', NULL, 'Vigente'),
('ch_herrera',    'ch123',     'Claudia Herrera',     'conductor', NULL, 'Vigente'),
('ch_romero',     'ch123',     'Fabián Romero',       'conductor', NULL, 'Vigente'),
('ch_jimenez',    'ch123',     'Laura Jiménez',       'conductor', NULL, 'Renovación Requerida'),
('ch_moreno',     'ch123',     'Sergio Moreno',       'conductor', NULL, 'Vigente'),
('ch_nunez',      'ch123',     'Alejandra Núñez',     'conductor', NULL, 'Vigente'),
('ch_alvarez',    'ch123',     'Javier Álvarez',      'conductor', NULL, 'Vigente'),
('ch_ruiz',       'ch123',     'Mónica Ruiz',         'conductor', NULL, 'Vigente'),
('ch_diaz',       'ch123',     'Hernán Díaz',         'conductor', NULL, 'Vigente'),
('ch_perez',      'ch123',     'Silvina Pérez',       'conductor', NULL, 'Vigente'),
('ch_sanchez',    'ch123',     'Ariel Sánchez',       'conductor', NULL, 'Vigente'),
('ch_castro',     'ch123',     'Graciela Castro',     'conductor', NULL, 'Vencida'),
('ch_ortega',     'ch123',     'Emilio Ortega',       'conductor', NULL, 'Vigente'),
('ch_ramos',      'ch123',     'Natalia Ramos',       'conductor', NULL, 'Vigente'),
('ch_vargas',     'ch123',     'Omar Vargas',         'conductor', NULL, 'Vigente'),
('ch_guerrero',   'ch123',     'Stella Guerrero',     'conductor', NULL, 'Vigente'),
('ch_navarro',    'ch123',     'Claudio Navarro',     'conductor', NULL, 'Vigente'),
('ch_medina',     'ch123',     'Rosa Medina',         'conductor', NULL, 'Vigente'),
('ch_aguilar',    'ch123',     'Daniel Aguilar',      'conductor', NULL, 'Vigente'),
('ch_rios',       'ch123',     'Verónica Ríos',       'conductor', NULL, 'Vigente'),
('ch_ponce',      'ch123',     'Cristian Ponce',      'conductor', NULL, 'Vigente'),
('ch_cabrera',    'ch123',     'Analía Cabrera',      'conductor', NULL, 'Vigente'),
('ch_fuentes',    'ch123',     'Marcelo Fuentes',     'conductor', NULL, 'Vigente'),
('ch_delgado',    'ch123',     'Viviana Delgado',     'conductor', NULL, 'Vigente'),
('ch_moran',      'ch123',     'Eduardo Morán',       'conductor', NULL, 'Renovación Requerida'),
('ch_sosa',       'ch123',     'Lorena Sosa',         'conductor', NULL, 'Vigente'),
('ch_ibarra',     'ch123',     'Matías Ibarra',       'conductor', NULL, 'Vigente'),
('ch_bravo',      'ch123',     'Susana Bravo',        'conductor', NULL, 'Vigente'),
('ch_lara',       'ch123',     'Gonzalo Lara',        'conductor', NULL, 'Vigente'),
('ch_ureña',      'ch123',     'Patricia Ureña',      'conductor', NULL, 'Vigente'),
('ch_barrera',    'ch123',     'Rodrigo Barrera',     'conductor', NULL, 'Vigente'),
('ch_acosta',     'ch123',     'Beatriz Acosta',      'conductor', NULL, 'Vigente'),
('ch_espinoza',   'ch123',     'Rubén Espinoza',      'conductor', NULL, 'Vigente'),
('ch_pena',       'ch123',     'Cecilia Peña',        'conductor', NULL, 'Vigente'),
('ch_contreras',  'ch123',     'Germán Contreras',    'conductor', NULL, 'Vigente'),
('ch_zamora',     'ch123',     'Andrea Zamora',       'conductor', NULL, 'Vigente'),
('ch_tapia',      'ch123',     'Roberto Tapia',       'conductor', NULL, 'Vigente'),
('ch_miranda',    'ch123',     'Florencia Miranda',   'conductor', NULL, 'Vigente'),
('ch_bermudez',   'ch123',     'Pablo Bermúdez',      'conductor', NULL, 'Vigente'),
('ch_nieto',      'ch123',     'Adriana Nieto',       'conductor', NULL, 'Vigente'),
('ch_serrano',    'ch123',     'Walter Serrano',      'conductor', NULL, 'Vigente'),
('ch_sandoval',   'ch123',     'Carolina Sandoval',   'conductor', NULL, 'Vigente'),
('ch_montoya',    'ch123',     'Eugenio Montoya',     'conductor', NULL, 'Vigente'),
('ch_vega2',      'ch123',     'Miriam Vega',         'conductor', NULL, 'Vigente'),
('ch_mendoza2',   'ch123',     'Diego Mendoza',       'conductor', NULL, 'Vigente'),
('ch_duarte',     'ch123',     'Alejandro Duarte',    'conductor', NULL, 'Vigente'),
('ch_vera',       'ch123',     'Silvana Vera',        'conductor', NULL, 'Vigente'),
('ch_campos',     'ch123',     'Marcos Campos',       'conductor', NULL, 'Vigente'),
('ch_paredes',    'ch123',     'Daniela Paredes',     'conductor', NULL, 'Vigente'),
('ch_molina2',    'ch123',     'Gustavo Molina',      'conductor', NULL, 'Vigente'),
('ch_arce',       'ch123',     'Nora Arce',           'conductor', NULL, 'Vigente'),
('ch_pineda',     'ch123',     'Francisco Pineda',    'conductor', NULL, 'Vigente'),
('ch_rangel',     'ch123',     'Liliana Rangel',      'conductor', NULL, 'Vigente'),
('ch_santiago',   'ch123',     'Héctor Santiago',     'conductor', NULL, 'Vigente'),
('ch_arrieta',    'ch123',     'Nadia Arrieta',       'conductor', NULL, 'Vigente'),
('ch_blanco',     'ch123',     'Osvaldo Blanco',      'conductor', NULL, 'Vigente'),
('ch_coronel',    'ch123',     'Flavia Coronel',      'conductor', NULL, 'Vigente'),
('ch_rojas',      'ch123',     'Ignacio Rojas',       'conductor', NULL, 'Vigente'),
('ch_paz',        'ch123',     'Elisa Paz',           'conductor', NULL, 'Vencida'),
('ch_ocampo',     'ch123',     'Ramiro Ocampo',       'conductor', NULL, 'Vigente'),
('ch_aguirre',    'ch123',     'Karina Aguirre',      'conductor', NULL, 'Vigente'),
('ch_gaitan',     'ch123',     'Mauricio Gaitán',     'conductor', NULL, 'Vigente'),
('ch_olvera',     'ch123',     'Natalia Olvera',      'conductor', NULL, 'Vigente'),
('ch_reina',      'ch123',     'Simón Reina',         'conductor', NULL, 'Vigente'),
('ch_vergara',    'ch123',     'Paola Vergara',       'conductor', NULL, 'Vigente'),
('ch_escobar',    'ch123',     'Jonatan Escobar',     'conductor', NULL, 'Vigente'),
('ch_tovar',      'ch123',     'Mercedes Tovar',      'conductor', NULL, 'Vigente'),
('ch_montes',     'ch123',     'César Montes',        'conductor', NULL, 'Vigente'),
('ch_quispe',     'ch123',     'Irene Quispe',        'conductor', NULL, 'Vigente'),
('ch_naranjo',    'ch123',     'Maximiliano Naranjo', 'conductor', NULL, 'Vigente'),
('ch_zapata',     'ch123',     'Lorenza Zapata',      'conductor', NULL, 'Vigente'),
('ch_cano',       'ch123',     'Leandro Cano',        'conductor', NULL, 'Vigente'),
('ch_rendon',     'ch123',     'Amanda Rendón',       'conductor', NULL, 'Vigente');

-- ─── PERSONAL DE TALLER (20) ─────────────────────────────────
INSERT INTO users (username, password, name, role, avatar, license_status) VALUES
('taller_jefe',     'taller123', 'Jorge Villanueva',    'taller', NULL, 'Vigente'),
('taller_sub',      'taller123', 'Raúl Esquivel',       'taller', NULL, 'Vigente'),
('taller_mec1',     'taller123', 'Fernando Ríos',       'taller', NULL, 'Vigente'),
('taller_mec2',     'taller123', 'Leonardo Bustos',     'taller', NULL, 'Vigente'),
('taller_mec3',     'taller123', 'Alfredo Soria',       'taller', NULL, 'Vigente'),
('taller_mec4',     'taller123', 'Ramón Orozco',        'taller', NULL, 'Vigente'),
('taller_mec5',     'taller123', 'Ignacio Palacios',    'taller', NULL, 'Vigente'),
('taller_mec6',     'taller123', 'Tomás Leiva',         'taller', NULL, 'Vigente'),
('taller_mec7',     'taller123', 'Enrique Quiroga',     'taller', NULL, 'Vigente'),
('taller_mec8',     'taller123', 'Horacio Medrano',     'taller', NULL, 'Vigente'),
('taller_elec1',    'taller123', 'Sebastián Correia',   'taller', NULL, 'Vigente'),
('taller_elec2',    'taller123', 'Felipe Barrionuevo',  'taller', NULL, 'Vigente'),
('taller_elec3',    'taller123', 'Valentín Gómez',      'taller', NULL, 'Vigente'),
('taller_neu1',     'taller123', 'Alberto Pacheco',     'taller', NULL, 'Vigente'),
('taller_neu2',     'taller123', 'Luciano Vidal',       'taller', NULL, 'Vigente'),
('taller_neu3',     'taller123', 'Edgardo Cuevas',      'taller', NULL, 'Vigente'),
('taller_lav1',     'taller123', 'Nicolás Heredia',     'taller', NULL, 'Vigente'),
('taller_lav2',     'taller123', 'Erika Molano',        'taller', NULL, 'Vigente'),
('taller_coord1',   'taller123', 'Patricia Serpa',      'taller', NULL, 'Vigente'),
('taller_coord2',   'taller123', 'Mario Quintero',      'taller', NULL, 'Vigente');

-- ─── ADMINISTRATIVOS (10) ────────────────────────────────────
INSERT INTO users (username, password, name, role, avatar, license_status) VALUES
('admin_rrhh',      'admin123', 'Susana Delgado',      'administrativo', NULL, 'Vigente'),
('admin_contab',    'admin123', 'Marcelo Prieto',      'administrativo', NULL, 'Vigente'),
('admin_factura',   'admin123', 'Valeria Ojeda',       'administrativo', NULL, 'Vigente'),
('admin_compras',   'admin123', 'Daniel Estrada',      'administrativo', NULL, 'Vigente'),
('admin_legales',   'admin123', 'Cecilia Funes',       'administrativo', NULL, 'Vigente'),
('admin_tesor',     'admin123', 'Gustavo Núñez',       'administrativo', NULL, 'Vigente'),
('admin_seg',       'admin123', 'Estela Carrizo',      'administrativo', NULL, 'Vigente'),
('admin_it',        'admin123', 'Rodrigo Páez',        'administrativo', NULL, 'Vigente'),
('admin_gerencia',  'admin123', 'Mirna Olivares',      'administrativo', NULL, 'Vigente'),
('admin_soporte',   'admin123', 'Bruno Salinas',       'administrativo', NULL, 'Vigente');

-- ─── VEHÍCULOS ────────────────────────────────────────────────
INSERT INTO vehicles (id, model, status, battery, driver_id, cargo_limit, current_cargo, range_left, current_location, vtv_expiration) VALUES
('VM-042', 'e-Truck Pro 2024',   'En Ruta',        85, NULL, 4.5, 3.8, 410, 'Av. Insurgentes Sur 1234, Ciudad de México', '2023-10-22'),
('VM-018', 'e-Truck Delivery',   'Cargando',        42, (SELECT id FROM users WHERE username = 'chofer'), 24.0, 18.5, 340, 'Centro de Distribución Norte, Buenos Aires', '2023-12-15'),
('VM-099', 'e-Truck Heavy Duty', 'Crítico',         12, (SELECT id FROM users WHERE username = 'ana'),   12.0, 10.8, 45,  'Av. Insurgentes Sur 1234, Ciudad de México', '2024-03-01'),
('VM-055', 'e-Truck Pro',        'En Ruta',         92, (SELECT id FROM users WHERE username = 'luis'),  4.5,  3.8,  410, 'Av. Insurgentes Sur 1234, Ciudad de México', '2024-05-10'),
('VM-105', 'e-Truck Pro 2024',   'Cargando',        60, NULL, 4.5, 2.0, 200, 'Centro de Distribución Sur', '2024-06-01');

-- ─── ALERTAS ─────────────────────────────────────────────────
INSERT INTO alerts (vehicle_id, title, description, severity, status) VALUES
('VM-042', 'VTV Vencida',             'La Verificación Técnica Vehicular para vehículos pesados eléctricos expiró hace 2 días. El camión no puede circular sin oblea vigente.', 'error',   'Activa'),
('VM-018', 'Mantenimiento de Motores','Revisión programada de eficiencia de motores eléctricos y balanceo de celdas de batería (50,000 km).', 'warning', 'Activa'),
('VM-105', 'Revisión de Neumáticos', 'Presión baja detectada. El torque de salida eléctrico requiere un desgaste uniforme en neumáticos reforzados.', 'info', 'Activa');

-- ─── VIAJES HISTÓRICOS (Carlos Mendoza) ──────────────────────
INSERT INTO trips (driver_id, vehicle_id, trip_date, status, total_distance, estimated_time, total_stops, expenses_amount, expenses_detail) VALUES
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-20', 'Completado', 45.0, '1h 10m', 2, 4500.00, 'Peajes Autopista y Almuerzo'),
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-22', 'Completado', 68.0, '2h 00m', 2, 8200.00, 'Peajes y Recarga de Batería en YPF'),
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-24', 'Completado', 45.0, '1h 15m', 2, 3200.00, 'Peajes e insumos menores');

-- ─── VIAJE ACTIVO (Carlos Mendoza) ───────────────────────────
INSERT INTO trips (driver_id, vehicle_id, trip_date, status, total_distance, estimated_time, total_stops) VALUES
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-24', 'En Progreso', 142.0, '4h 15m', 4);

INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next) VALUES
((SELECT MAX(id) FROM trips), 1, 'Base Operativa Buenos Aires', 'Origen',     'Completado',  'Salida: 08:00',                          45.0),
((SELECT MAX(id) FROM trips), 2, 'CD Norte',                    'Intermedio', 'Siguiente',   'ETA: 14:30',                             32.0),
((SELECT MAX(id) FROM trips), 3, 'Carga Rápida YPF',           'Carga',      'Planificado', 'Carga estimada: 45 min (hasta 80%)',     65.0),
((SELECT MAX(id) FROM trips), 4, 'Depósito Lanús',             'Destino',    'Planificado', 'Entrega final',                           0.0);

INSERT INTO stop_tasks (stop_id, description, done) VALUES
((SELECT id FROM stops WHERE trip_id = (SELECT MAX(id) FROM trips) AND stop_order = 2), 'Descarga 5.5t de mercancía general', FALSE),
((SELECT id FROM stops WHERE trip_id = (SELECT MAX(id) FROM trips) AND stop_order = 2), 'Firma de remito digital',             FALSE);
