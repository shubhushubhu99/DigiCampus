-- DigiCampus Digital Twin MySQL Database Schema
CREATE DATABASE IF NOT EXISTS digicampus;
USE digicampus;

-- 1. Campuses
CREATE TABLE IF NOT EXISTS campuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    city VARCHAR(100),
    total_area_acres DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buildings
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    type ENUM('academic', 'innovation_lab', 'library', 'administration', 'auditorium', 'sports_complex') DEFAULT 'academic',
    total_floors INT DEFAULT 3,
    description TEXT,
    pos_x INT DEFAULT 100,
    pos_y INT DEFAULT 100,
    color VARCHAR(30) DEFAULT '#3B82F6',
    FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE
);

-- 3. Floors
CREATE TABLE IF NOT EXISTS floors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    floor_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_building_floor (building_id, floor_number)
);

-- 4. Rooms & Labs
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    floor_id INT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 40,
    grid_x INT DEFAULT 0,
    grid_y INT DEFAULT 0,
    grid_w INT DEFAULT 2,
    grid_h INT DEFAULT 2,
    has_projector BOOLEAN DEFAULT TRUE,
    has_ac BOOLEAN DEFAULT TRUE,
    has_smartboard BOOLEAN DEFAULT FALSE,
    qr_code_token VARCHAR(100) UNIQUE,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- 5. Live Telemetry Snapshot (Real-time Twin State)
CREATE TABLE IF NOT EXISTS telemetry_live (
    room_id INT PRIMARY KEY,
    current_occupancy INT DEFAULT 0,
    temperature DECIMAL(4,1) DEFAULT 24.0,
    humidity DECIMAL(4,1) DEFAULT 50.0,
    power_watts INT DEFAULT 850,
    lights_status VARCHAR(20) DEFAULT 'ON',
    ac_status VARCHAR(20) DEFAULT 'ON',
    ac_set_temp DECIMAL(3,1) DEFAULT 22.0,
    computers_online INT DEFAULT 0,
    computers_total INT DEFAULT 0,
    air_quality_aqi INT DEFAULT 42,
    noise_db INT DEFAULT 45,
    network_status VARCHAR(30) DEFAULT 'EXCELLENT',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 6. Telemetry History (Time series logs for charts)
CREATE TABLE IF NOT EXISTS telemetry_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    occupancy INT,
    temperature DECIMAL(4,1),
    power_watts INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 7. Devices & Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    device_name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'ONLINE',
    ip_address VARCHAR(45),
    mac_address VARCHAR(30),
    specs_summary VARCHAR(255),
    last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 8. Parking Zones & Slots
CREATE TABLE IF NOT EXISTS parking_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    pos_x INT DEFAULT 300,
    pos_y INT DEFAULT 300,
    total_slots INT DEFAULT 20,
    FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    slot_number VARCHAR(20) NOT NULL,
    type VARCHAR(50) DEFAULT 'STANDARD',
    is_occupied BOOLEAN DEFAULT FALSE,
    vehicle_plate VARCHAR(50) NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES parking_zones(id) ON DELETE CASCADE
);

-- 9. Events & Classroom Schedules
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    instructor VARCHAR(150),
    type VARCHAR(50) DEFAULT 'lecture',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week VARCHAR(30) DEFAULT 'Monday',
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 10. Room Bookings & QR Verification
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    booked_by_name VARCHAR(150) NOT NULL,
    booked_by_email VARCHAR(150) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendees_count INT DEFAULT 10,
    qr_token VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 11. AI Recommendations & Optimization Engine
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('REALLOCATION', 'ENERGY_SAVER', 'CAPACITY_WARNING', 'IOT_ANOMALY', 'PARKING') NOT NULL,
    priority ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    impacted_room_id INT NULL,
    suggested_room_id INT NULL,
    suggested_action VARCHAR(255),
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (impacted_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (suggested_room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 12. IoT MQTT Stream Logs
CREATE TABLE IF NOT EXISTS iot_message_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(150) NOT NULL,
    device_uid VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
