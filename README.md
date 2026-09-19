# 🌐 DigiCampus — Digital Twin Campus Platform

A full-stack, real-time **Digital Twin Campus** web platform replicating physical campus infrastructure, operational telemetry, and intelligent resource allocation.

Built based on the blueprint in [Idea 2.docx](file:///home/shubh/Desktop/DigiCampus/Idea%202.docx).

---

## 🏗️ Architecture & Technology Stack

| Component | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **TypeScript + React 19 + Vite** | Tailwind CSS v4, Lucide Icons, interactive 2.5D SVG spatial campus map, workstation cluster matrix, live SSE subscriber |
| **Backend** | **Python Flask + Gunicorn** | Modular Blueprints, PyMySQL connection pool, custom JSON serializer, background IoT simulation daemon, AI heuristic engine |
| **Database** | **MySQL 8.0** | Relational schema (`campuses`, `buildings`, `floors`, `rooms`, `telemetry_live`, `telemetry_history`, `equipment`, `parking`, `bookings`, `ai_recommendations`, `iot_message_logs`) |
| **Real-time Pipeline**| **Server-Sent Events (SSE) & MQTT Mock** | Real-time push updates every 3s mimicking edge ESP32 microcontrollers |

---

## 🚀 Key Features Built (Mapped to `Idea 2.docx`)

### 1. Spatial Campus Explorer & Floor Plan Navigator (🟢 Tier 1)
- **Interactive 2.5D Campus Map**: Turing Innovation Center, Aryabhata Academic Wing, Knowledge Hub & Library, Kalam Grand Auditorium, and Parking Lots.
- **Floor-by-Floor Directory**: Switch between Floor 1, Floor 2, Floor 3 to view live room cards with capacity status and micro-telemetry.
- **Universal Room Search**: Instant search across rooms, numbers, and buildings.

### 2. Live Digital Twin Nodes (🔴 Tier 3 Flagship Feature)
- **Exact LAB-204 Specification**:
  - 👥 **Occupancy**: `31/40` with live headcount simulation and visual capacity bar
  - 💡 **Lights**: `ON` / `OFF` with remote IoT relay override toggle
  - 🌡 **Temperature**: `24°C` with real-time DHT22 ambient fluctuation & AC setpoint control
  - 💻 **Computers**: `38/40 online` with an interactive 40-workstation cluster visual matrix
  - 📅 **Next Class**: `2:00 PM` countdown and scheduled course timetable
  - ⚡ **Power Consumption**: Real-time wattage meter (~2,450 W)
  - 🏷️ **Dynamic QR Code**: High-contrast QR access token for verified check-in
  - 🛠️ **Physical Hardware Inventory**: ESP32 Edge Gateway, 4K Projector, Cisco Gigabit switch, Daikin Dual Inverter ACs.

### 3. Campus Operations & Management (🟡 Tier 2)
- **Room Booking Engine**: Complete reservation system with automatic time-collision prevention and capacity enforcement.
- **Simulated Door QR Scanner**: Check in attendees with one click or scan token; instantly marks attendance and activates room HVAC & lighting in MySQL.
- **Smart Parking Twin**: Visual interactive North & South parking bays with live status (Available, Occupied, EV Charging, Reserved) and one-click car entry/exit simulation.

### 4. AI Resource & Energy Optimization Engine (🔴 Tier 3)
- **Automated Reallocation**: Evaluates over-crowded vs under-utilized labs and recommends moving sessions (e.g. *Move workshop from Lab 204 (78% full, high thermal load) to Lab 301 (12% full, cool climate)*).
- **One-Click Execution**: Clicking **Execute Now** automatically transfers the reservation in MySQL and rebalances headcounts.
- **Eco-Saver Standby**: Detects empty rooms with lights/AC left on and triggers automated standby to cut power waste.

### 5. Physical-to-Virtual IoT Pipeline
- **ESP32 Edge Gateway Simulator**: Simulates `Sensor -> ESP32 -> MQTT Broker -> Flask Backend -> Digital Twin` pipeline.
- **Live MQTT Feed Inspector**: Real-time JSON terminal viewing incoming packets on `campus/telemetry/#`.
- **Edge Telemetry Injector**: Live sliders to manipulate temperature and headcounts on any room.

---

## ⚡ Quick Start

### Start all services:
```bash
cd /home/shubh/Desktop/DigiCampus
./start.sh
```

### Stop all services:
```bash
./stop.sh
```

### Access URLs:
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🗄️ MySQL Connection Details

- **Host**: `127.0.0.1`
- **Port**: `3306`
- **Database**: `digicampus`
- **Username**: `digiuser`
- **Password**: `digipass`
- **Root Password**: `digiroot`
