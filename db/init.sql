-- VerdeMov Database Initialization Script
-- PostgreSQL Schema and Seed Data

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
    role VARCHAR(20) NOT NULL CHECK (role IN ('operador', 'conductor')),
    avatar TEXT,
    license_status VARCHAR(50) DEFAULT 'Vigente'
);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    id VARCHAR(20) PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('En Ruta', 'Cargando', 'Crítico')),
    battery INTEGER NOT NULL CHECK (battery >= 0 AND battery <= 100),
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
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
    total_stops INTEGER NOT NULL DEFAULT 0
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

-- Seed Data Insertion

-- Insert Users
INSERT INTO users (username, password, name, role, avatar, license_status) VALUES
('gerente', 'gerente123', 'Gerente de Flota', 'operador', NULL, 'Vigente'),
('chofer', 'chofer123', 'Carlos Mendoza', 'conductor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', 'Renovación Requerida'),
('ana', 'ana123', 'Ana Silva', 'conductor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 'Vigente'),
('luis', 'luis123', 'Luis García', 'conductor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150', 'Vigente');

-- Insert Vehicles (using subqueries to assign driver_id)
INSERT INTO vehicles (id, model, status, battery, driver_id, cargo_limit, current_cargo, range_left, current_location, vtv_expiration) VALUES
('VM-042', 'e-Truck Pro 2024', 'En Ruta', 85, (SELECT id FROM users WHERE username = 'chofer'), 4.5, 3.8, 410, 'Av. Insurgentes Sur 1234, Ciudad de México', '2023-10-22'),
('VM-018', 'e-Truck Delivery', 'Cargando', 42, (SELECT id FROM users WHERE username = 'chofer'), 24.0, 18.5, 340, 'Centro de Distribución Norte, Buenos Aires', '2023-12-15'),
('VM-099', 'e-Truck Heavy Duty', 'Crítico', 12, (SELECT id FROM users WHERE username = 'ana'), 12.0, 10.8, 45, 'Av. Insurgentes Sur 1234, Ciudad de México', '2024-03-01'),
('VM-055', 'e-Truck Pro', 'En Ruta', 92, (SELECT id FROM users WHERE username = 'luis'), 4.5, 3.8, 410, 'Av. Insurgentes Sur 1234, Ciudad de México', '2024-05-10'),
('VM-105', 'e-Truck Pro 2024', 'Cargando', 60, NULL, 4.5, 2.0, 200, 'Centro de Distribución Sur', '2024-06-01');

-- Insert Alerts
INSERT INTO alerts (vehicle_id, title, description, severity, status) VALUES
('VM-042', 'VTV Vencida', 'La Verificación Técnica Vehicular para vehículos pesados eléctricos expiró hace 2 días. El camión no puede circular sin oblea vigente.', 'error', 'Activa'),
('VM-018', 'Mantenimiento de Motores', 'Revisión programada de eficiencia de motores eléctricos y balanceo de celdas de batería (50,000 km).', 'warning', 'Activa'),
('VM-105', 'Revisión de Neumáticos', 'Presión baja detectada. El torque de salida eléctrico requiere un desgaste uniforme en neumáticos reforzados.', 'info', 'Activa');

-- Insert Historical / Completed Trips for Carlos Mendoza (chofer)
INSERT INTO trips (driver_id, vehicle_id, trip_date, status, total_distance, estimated_time, total_stops) VALUES
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-20', 'Completado', 45.0, '1h 10m', 2),
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-22', 'Completado', 68.0, '2h 00m', 2),
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-24', 'Completado', 45.0, '1h 15m', 2);

-- Insert Current Active Trip for Carlos Mendoza (chofer) on VM-018
INSERT INTO trips (driver_id, vehicle_id, trip_date, status, total_distance, estimated_time, total_stops) VALUES
((SELECT id FROM users WHERE username = 'chofer'), 'VM-018', '2023-10-24', 'En Progreso', 142.0, '4h 15m', 4);

-- Insert Stops for the Active Trip (last inserted trip ID can be fetched with a helper)
-- Stop 1: Base Operativa Buenos Aires
INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next) VALUES
((SELECT MAX(id) FROM trips), 1, 'Base Operativa Buenos Aires', 'Origen', 'Completado', 'Salida: 08:00', 45.0);

-- Stop 2: CD Norte
INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next) VALUES
((SELECT MAX(id) FROM trips), 2, 'CD Norte', 'Intermedio', 'Siguiente', 'ETA: 14:30', 32.0);

-- Stop 3: Carga Rápida YPF
INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next) VALUES
((SELECT MAX(id) FROM trips), 3, 'Carga Rápida YPF', 'Carga', 'Planificado', 'Carga estimada: 45 min (hasta 80%)', 65.0);

-- Stop 4: Depósito Lanús
INSERT INTO stops (trip_id, stop_order, name, stop_type, status, details, distance_to_next) VALUES
((SELECT MAX(id) FROM trips), 4, 'Depósito Lanús', 'Destino', 'Planificado', 'Entrega final', 0.0);

-- Insert Tasks for CD Norte Stop
INSERT INTO stop_tasks (stop_id, description, done) VALUES
((SELECT id FROM stops WHERE trip_id = (SELECT MAX(id) FROM trips) AND stop_order = 2), 'Descarga 5.5t de mercancía general', FALSE),
((SELECT id FROM stops WHERE trip_id = (SELECT MAX(id) FROM trips) AND stop_order = 2), 'Firma de remito digital', FALSE);
