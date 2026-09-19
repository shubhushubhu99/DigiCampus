-- DigiCampus Digital Twin Seed Data
USE digicampus;

-- 1. Campus
INSERT INTO campuses (id, name, code, description, city, total_area_acres)
VALUES (1, 'Apex Institute of Technology & Research', 'AITR-CAMPUS', 'Smart High-Tech Digital Twin Enabled Engineering Campus', 'Bengaluru', 45.5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Buildings
INSERT INTO buildings (id, campus_id, code, name, type, total_floors, description, pos_x, pos_y, color)
VALUES
(1, 1, 'BLD-TECH', 'Turing Innovation Center', 'innovation_lab', 3, 'Houses advanced computer labs, AI research, and IoT testbeds.', 180, 140, '#06B6D4'),
(2, 1, 'BLD-ACAD', 'Aryabhata Academic Wing', 'academic', 3, 'Lecture halls, seminar rooms, and faculty chambers.', 460, 140, '#3B82F6'),
(3, 1, 'BLD-LIB', 'Central Knowledge Hub & Library', 'library', 2, 'Digital archives, quiet study spaces, and research cubicles.', 180, 360, '#8B5CF6'),
(4, 1, 'BLD-AUD', 'Kalam Grand Auditorium', 'auditorium', 1, 'Mega hall for hackathons, guest seminars, and convocation.', 460, 360, '#EC4899')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Floors
INSERT INTO floors (id, building_id, floor_number, name) VALUES
(1, 1, 1, 'Tech Center - Ground Floor (Robotics & Hardware)'),
(2, 1, 2, 'Tech Center - 2nd Floor (Computing & AI Labs)'),
(3, 1, 3, 'Tech Center - 3rd Floor (Cloud & Cyber Security)'),
(4, 2, 1, 'Academic Wing - Ground Floor (Classrooms)'),
(5, 2, 2, 'Academic Wing - 2nd Floor (Lecture Halls & Seminar)'),
(6, 3, 1, 'Library - Ground Floor'),
(7, 4, 1, 'Main Auditorium')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Rooms & Labs
INSERT INTO rooms (id, building_id, floor_id, room_number, name, type, capacity, grid_x, grid_y, grid_w, grid_h, has_projector, has_ac, has_smartboard, qr_code_token) VALUES
-- Turing Tech Center 2nd Floor
(1, 1, 2, 'LAB-204', 'Advanced Computing & IoT Lab', 'computer_lab', 40, 1, 1, 2, 2, TRUE, TRUE, TRUE, 'QR-AITR-LAB-204'),
(2, 1, 2, 'LAB-301', 'High Performance AI & Cloud Lab', 'ai_robotics_lab', 50, 4, 1, 2, 2, TRUE, TRUE, TRUE, 'QR-AITR-LAB-301'),
(3, 1, 2, 'LAB-202', 'Embedded Systems & Robotics Lab', 'electronics_lab', 30, 1, 4, 2, 2, TRUE, TRUE, FALSE, 'QR-AITR-LAB-202'),
(4, 1, 2, 'SR-210', 'Faculty Collaboration Suite', 'faculty_room', 15, 4, 4, 2, 2, FALSE, TRUE, TRUE, 'QR-AITR-SR-210'),
-- Turing Tech Center 1st Floor
(5, 1, 1, 'LAB-101', 'Software Engineering Lab 1', 'computer_lab', 45, 1, 1, 2, 2, TRUE, TRUE, TRUE, 'QR-AITR-LAB-101'),
(6, 1, 1, 'LAB-102', 'Electronics & VLSI Lab', 'electronics_lab', 35, 4, 1, 2, 2, TRUE, TRUE, FALSE, 'QR-AITR-LAB-102'),
-- Academic Wing
(7, 2, 5, 'LH-201', 'Interactive Lecture Hall A', 'lecture_hall', 120, 1, 1, 3, 2, TRUE, TRUE, TRUE, 'QR-AITR-LH-201'),
(8, 2, 5, 'SH-205', 'Executive Seminar Hall', 'seminar_hall', 80, 4, 1, 3, 2, TRUE, TRUE, TRUE, 'QR-AITR-SH-205'),
(9, 2, 4, 'CR-105', 'Smart Classroom 105', 'lecture_hall', 60, 1, 1, 2, 2, TRUE, TRUE, FALSE, 'QR-AITR-CR-105'),
-- Library & Auditorium
(10, 3, 6, 'LIB-QUIET', 'Digital Research Lounge', 'seminar_hall', 50, 1, 1, 3, 2, FALSE, TRUE, FALSE, 'QR-AITR-LIB-01'),
(11, 4, 7, 'AUD-MAIN', 'Grand Auditorium Hall', 'auditorium', 450, 1, 1, 4, 3, TRUE, TRUE, TRUE, 'QR-AITR-AUD-01')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Live Telemetry Snapshots (Exact matching document example for LAB-204)
INSERT INTO telemetry_live 
(room_id, current_occupancy, temperature, humidity, power_watts, lights_status, ac_status, ac_set_temp, computers_online, computers_total, air_quality_aqi, noise_db, network_status)
VALUES
(1, 31, 24.0, 48.5, 2450, 'ON', 'ON', 22.0, 38, 40, 34, 52, 'EXCELLENT'), -- LAB-204
(2, 6, 21.5, 45.0, 920, 'ON', 'ON', 21.0, 12, 50, 28, 38, 'EXCELLENT'),   -- LAB-301 (Ideal target for reallocation!)
(3, 18, 25.2, 52.0, 1600, 'ON', 'ON', 24.0, 15, 30, 45, 60, 'GOOD'),
(4, 4, 23.0, 49.0, 350, 'ON', 'ON', 23.0, 4, 10, 30, 32, 'EXCELLENT'),
(5, 42, 26.1, 54.0, 2800, 'ON', 'ON', 21.0, 42, 45, 55, 68, 'GOOD'),
(6, 0, 27.0, 58.0, 85, 'OFF', 'OFF', 25.0, 0, 35, 25, 28, 'OFFLINE'),
(7, 95, 23.8, 51.0, 3200, 'ON', 'ON', 20.0, 1, 2, 48, 72, 'EXCELLENT'),
(8, 0, 26.5, 50.0, 120, 'OFF', 'OFF', 24.0, 0, 0, 32, 25, 'OFFLINE'),
(9, 35, 24.2, 49.0, 880, 'ON', 'ON', 23.0, 0, 0, 38, 58, 'GOOD'),
(10, 22, 22.8, 46.0, 600, 'ON', 'ON', 22.0, 18, 25, 22, 30, 'EXCELLENT'),
(11, 0, 28.0, 60.0, 210, 'OFF', 'OFF', 24.0, 0, 0, 30, 20, 'STANDBY')
ON DUPLICATE KEY UPDATE 
current_occupancy=VALUES(current_occupancy),
temperature=VALUES(temperature),
power_watts=VALUES(power_watts);

-- 6. Devices & Workstations (For LAB-204 and LAB-301)
INSERT INTO equipment (room_id, device_name, type, status, ip_address, mac_address, specs_summary) VALUES
(1, 'ESP32 Edge Gateway Lab 204', 'sensor_esp32', 'ONLINE', '192.168.10.1', '24:6F:28:B1:01:A0', 'ESP32 Dual-Core, DHT22, PIR Motion, PZEM-004T Power'),
(1, 'Lab 204 4K Laser Projector', 'projector', 'ONLINE', '192.168.10.2', '00:1E:C2:A4:12:05', 'Optoma 4K UHD, 4500 Lumens'),
(1, 'Central Core Switch 48P', 'router', 'ONLINE', '192.168.10.254', 'D4:CA:6D:88:91:02', 'Cisco Catalyst 48-Port PoE+ Gigabit'),
(1, 'Dual Inverter Split AC 1', 'ac_unit', 'ONLINE', '192.168.10.15', '5C:CF:7F:43:08:11', 'Daikin Smart Inverter 2.5 Ton'),
(1, 'Dual Inverter Split AC 2', 'ac_unit', 'ONLINE', '192.168.10.16', '5C:CF:7F:43:08:12', 'Daikin Smart Inverter 2.5 Ton'),
-- Workstation cluster in LAB 204 (Sample nodes)
(1, 'WS-204-01 (Instructor Node)', 'pc', 'ONLINE', '192.168.10.101', 'A4:BB:6D:11:22:01', 'Core i9, 64GB RAM, RTX 4080'),
(1, 'WS-204-02', 'pc', 'ONLINE', '192.168.10.102', 'A4:BB:6D:11:22:02', 'Core i7, 32GB RAM, RTX 4060'),
(1, 'WS-204-03', 'pc', 'ONLINE', '192.168.10.103', 'A4:BB:6D:11:22:03', 'Core i7, 32GB RAM, RTX 4060'),
(1, 'WS-204-04', 'pc', 'OFFLINE', '192.168.10.104', 'A4:BB:6D:11:22:04', 'Core i7, 32GB RAM, RTX 4060 (Scheduled Update)'),
(1, 'WS-204-05', 'pc', 'ONLINE', '192.168.10.105', 'A4:BB:6D:11:22:05', 'Core i7, 32GB RAM, RTX 4060'),
-- LAB 301 Workstations
(2, 'ESP32 Edge Gateway Lab 301', 'sensor_esp32', 'ONLINE', '192.168.11.1', '24:6F:28:C2:03:F1', 'ESP32 Dual-Core, DHT22, BME680, PZEM Power'),
(2, 'AI Cluster Node 01', 'server', 'ONLINE', '192.168.11.10', 'EC:F4:BB:92:44:01', 'Dual Xeon, 256GB RAM, 4x NVIDIA A100 80GB')
ON DUPLICATE KEY UPDATE device_name=VALUES(device_name);

-- 7. Parking Zones & Slots
INSERT INTO parking_zones (id, campus_id, name, code, pos_x, pos_y, total_slots) VALUES
(1, 1, 'North Wing Faculty & Visitor Lot', 'LOT-NORTH', 100, 520, 16),
(2, 1, 'South Tech Hub EV & Student Lot', 'LOT-SOUTH', 450, 520, 20)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO parking_slots (zone_id, slot_number, type, is_occupied, vehicle_plate) VALUES
-- LOT-NORTH
(1, 'N-01', 'FACULTY', TRUE, 'KA-01-MJ-2024'),
(1, 'N-02', 'FACULTY', TRUE, 'KA-05-AA-9988'),
(1, 'N-03', 'FACULTY', FALSE, NULL),
(1, 'N-04', 'HANDICAP', FALSE, NULL),
(1, 'N-05', 'STANDARD', TRUE, 'DL-03-CC-4567'),
(1, 'N-06', 'STANDARD', FALSE, NULL),
(1, 'N-07', 'STANDARD', TRUE, 'MH-12-PQ-8821'),
(1, 'N-08', 'STANDARD', FALSE, NULL),
(1, 'N-09', 'EV_CHARGING', TRUE, 'KA-03-EV-0001'),
(1, 'N-10', 'EV_CHARGING', FALSE, NULL),
-- LOT-SOUTH
(2, 'S-01', 'EV_CHARGING', TRUE, 'KA-04-EV-7721'),
(2, 'S-02', 'EV_CHARGING', TRUE, 'KA-02-EV-4419'),
(2, 'S-03', 'STANDARD', FALSE, NULL),
(2, 'S-04', 'STANDARD', TRUE, 'KA-51-ZZ-1200'),
(2, 'S-05', 'STANDARD', FALSE, NULL),
(2, 'S-06', 'STANDARD', FALSE, NULL),
(2, 'S-07', 'TWO_WHEELER', TRUE, 'KA-01-EE-3211'),
(2, 'S-08', 'TWO_WHEELER', TRUE, 'KA-01-EE-3212');

-- 8. Classroom Schedules
INSERT INTO schedules (room_id, title, instructor, type, start_time, end_time, day_of_week) VALUES
(1, 'Cyber-Physical Systems & IoT Practicum', 'Dr. Sarah Jenkins', 'lab', '10:00:00', '12:30:00', 'Monday'),
(1, 'Machine Learning Model Deployment Workshop', 'Prof. Arvind Menon', 'workshop', '14:00:00', '16:00:00', 'Monday'),
(2, 'Distributed Cloud Architecture', 'Dr. Lisa Wong', 'lecture', '11:00:00', '13:00:00', 'Monday'),
(2, 'Deep Learning on Edge Devices', 'Prof. Vikram Roy', 'lab', '15:30:00', '17:30:00', 'Monday'),
(7, 'Introduction to Autonomous Robotics', 'Dr. H. Tanaka', 'lecture', '09:00:00', '10:30:00', 'Monday'),
(8, 'Global AI Summit Keynote Preview', 'Industry Guest', 'seminar', '16:00:00', '18:00:00', 'Monday');

-- 9. Sample Bookings
INSERT INTO bookings (room_id, title, booked_by_name, booked_by_email, booking_date, start_time, end_time, attendees_count, qr_token, status)
VALUES
(1, 'Hands-on ESP32 Sensors Boot Camp', 'Alex Turner', 'alex.t@campus.edu', CURDATE(), '14:00:00', '16:00:00', 35, 'BOOKING-TOKEN-LAB204-TODAY', 'CONFIRMED'),
(8, 'ACM Student Chapter Hackathon Sync', 'Priya Sharma', 'priya.s@campus.edu', CURDATE(), '17:00:00', '19:00:00', 40, 'BOOKING-TOKEN-SH205-TODAY', 'CONFIRMED');

-- 10. AI Optimization Engine Recommendations (Directly aligning with doc)
INSERT INTO ai_recommendations (category, priority, title, description, impacted_room_id, suggested_room_id, suggested_action, is_applied)
VALUES
(
    'REALLOCATION',
    'HIGH',
    'AI Room Reallocation: Optimize Lab 204 to Lab 301',
    'Move upcoming 2:00 PM Workshop from Lab 204 to Lab 301. Lab 204 is at 78% capacity (31/40) with elevated thermal load (24°C, 2450W), whereas Lab 301 has 50 capacity, currently 12% occupancy (6/50) and cooler climate, saving 28% HVAC energy.',
    1,
    2,
    'Auto-transfer booking and notify attendees via DigiCampus App',
    FALSE
),
(
    'ENERGY_SAVER',
    'MEDIUM',
    'Automated Standby: Electronics Lab 102 Lights & HVAC',
    'Room LAB-102 has 0 active occupancy detected for >20 mins. Lights and HVAC are currently idle. Switching to Eco-Standby will conserve 850W.',
    6,
    NULL,
    'Execute standby power cut',
    FALSE
),
(
    'PARKING',
    'LOW',
    'North Lot Approaching EV Saturation',
    'North Parking Lot EV charging spots are 80% full. Route incoming EV vehicles towards South Tech Hub EV bays (4 available chargers).',
    NULL,
    NULL,
    'Update digital signage to guide vehicles to South Lot',
    FALSE
);
