from flask import Blueprint, jsonify, request
from db import query_all, query_one

campus_bp = Blueprint("campus", __name__)

@campus_bp.route("/api/campus", methods=["GET"])
def get_campus_overview():
    campus = query_one("SELECT * FROM campuses LIMIT 1")
    if not campus:
        return jsonify({"error": "Campus not found"}), 404

    # Aggregate live metrics
    stats = query_one("""
        SELECT 
            COALESCE(SUM(t.current_occupancy), 0) as total_occupants,
            COALESCE(SUM(r.capacity), 0) as total_capacity,
            COALESCE(SUM(t.power_watts), 0) as total_power_watts,
            COUNT(DISTINCT r.id) as total_rooms,
            SUM(CASE WHEN t.current_occupancy > 0 THEN 1 ELSE 0 END) as active_rooms,
            COALESCE(SUM(t.computers_online), 0) as total_online_pcs,
            COALESCE(SUM(t.computers_total), 0) as total_pcs
        FROM rooms r
        JOIN telemetry_live t ON r.id = t.room_id
    """)

    # Parking stats
    parking = query_one("""
        SELECT 
            COUNT(*) as total_slots,
            SUM(CASE WHEN is_occupied = TRUE THEN 1 ELSE 0 END) as occupied_slots,
            SUM(CASE WHEN is_occupied = FALSE THEN 1 ELSE 0 END) as available_slots,
            SUM(CASE WHEN type = 'EV_CHARGING' AND is_occupied = TRUE THEN 1 ELSE 0 END) as ev_in_use
        FROM parking_slots
    """)

    # Buildings summary
    buildings = query_all("""
        SELECT b.*, 
               COUNT(DISTINCT r.id) as room_count,
               COALESCE(SUM(t.current_occupancy), 0) as current_occupancy,
               COALESCE(SUM(r.capacity), 0) as capacity,
               COALESCE(SUM(t.power_watts), 0) as power_watts
        FROM buildings b
        LEFT JOIN rooms r ON b.id = r.building_id
        LEFT JOIN telemetry_live t ON r.id = t.room_id
        GROUP BY b.id
    """)

    return jsonify({
        "campus": campus,
        "metrics": {
            "total_occupants": int(stats["total_occupants"]),
            "total_capacity": int(stats["total_capacity"]),
            "occupancy_rate": round(float(stats["total_occupants"]) / max(1, float(stats["total_capacity"])) * 100, 1),
            "total_power_kw": round(float(stats["total_power_watts"]) / 1000.0, 2),
            "total_rooms": int(stats["total_rooms"]),
            "active_rooms": int(stats["active_rooms"]),
            "total_online_pcs": int(stats["total_online_pcs"]),
            "total_pcs": int(stats["total_pcs"]),
            "parking": {
                "total": int(parking["total_slots"] or 0),
                "occupied": int(parking["occupied_slots"] or 0),
                "available": int(parking["available_slots"] or 0),
                "ev_charging": int(parking["ev_in_use"] or 0)
            }
        },
        "buildings": buildings
    })

@campus_bp.route("/api/buildings", methods=["GET"])
def get_buildings():
    buildings = query_all("""
        SELECT b.*, 
               COUNT(DISTINCT r.id) as room_count,
               COALESCE(SUM(t.current_occupancy), 0) as current_occupancy,
               COALESCE(SUM(r.capacity), 0) as capacity,
               COALESCE(SUM(t.power_watts), 0) as power_watts
        FROM buildings b
        LEFT JOIN rooms r ON b.id = r.building_id
        LEFT JOIN telemetry_live t ON r.id = t.room_id
        GROUP BY b.id
    """)
    return jsonify(buildings)

@campus_bp.route("/api/buildings/<int:building_id>", methods=["GET"])
def get_building_details(building_id):
    building = query_one("SELECT * FROM buildings WHERE id = %s", (building_id,))
    if not building:
        return jsonify({"error": "Building not found"}), 404

    floors = query_all("SELECT * FROM floors WHERE building_id = %s ORDER BY floor_number ASC", (building_id,))
    
    rooms = query_all("""
        SELECT r.*, f.floor_number, f.name as floor_name,
               t.current_occupancy, t.temperature, t.humidity, t.power_watts,
               t.lights_status, t.ac_status, t.computers_online, t.computers_total,
               t.air_quality_aqi, t.noise_db, t.network_status
        FROM rooms r
        JOIN floors f ON r.floor_id = f.id
        JOIN telemetry_live t ON r.id = t.room_id
        WHERE r.building_id = %s
        ORDER BY f.floor_number, r.room_number
    """, (building_id,))

    return jsonify({
        "building": building,
        "floors": floors,
        "rooms": rooms
    })

@campus_bp.route("/api/rooms", methods=["GET"])
def get_rooms():
    building_id = request.args.get("building_id")
    room_type = request.args.get("type")
    search = request.args.get("q")

    sql = """
        SELECT r.*, b.name as building_name, b.code as building_code,
               f.floor_number, f.name as floor_name,
               t.current_occupancy, t.temperature, t.humidity, t.power_watts,
               t.lights_status, t.ac_status, t.computers_online, t.computers_total,
               t.air_quality_aqi, t.noise_db, t.network_status
        FROM rooms r
        JOIN buildings b ON r.building_id = b.id
        JOIN floors f ON r.floor_id = f.id
        JOIN telemetry_live t ON r.id = t.room_id
        WHERE 1=1
    """
    params = []

    if building_id:
        sql += " AND r.building_id = %s"
        params.append(building_id)
    if room_type:
        sql += " AND r.type = %s"
        params.append(room_type)
    if search:
        sql += " AND (r.name LIKE %s OR r.room_number LIKE %s OR b.name LIKE %s)"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern])

    sql += " ORDER BY r.room_number ASC"
    rooms = query_all(sql, params)
    return jsonify(rooms)

@campus_bp.route("/api/rooms/<int:room_id>", methods=["GET"])
def get_room_digital_twin(room_id):
    room = query_one("""
        SELECT r.*, b.name as building_name, b.code as building_code,
               f.floor_number, f.name as floor_name,
               t.current_occupancy, t.temperature, t.humidity, t.power_watts,
               t.lights_status, t.ac_status, t.ac_set_temp,
               t.computers_online, t.computers_total,
               t.air_quality_aqi, t.noise_db, t.network_status, t.updated_at as telemetry_updated_at
        FROM rooms r
        JOIN buildings b ON r.building_id = b.id
        JOIN floors f ON r.floor_id = f.id
        JOIN telemetry_live t ON r.id = t.room_id
        WHERE r.id = %s
    """, (room_id,))

    if not room:
        return jsonify({"error": "Room not found"}), 404

    # Equipment in room
    equipment = query_all("SELECT * FROM equipment WHERE room_id = %s ORDER BY type, device_name", (room_id,))

    # Today's schedules
    schedules = query_all("""
        SELECT * FROM schedules 
        WHERE room_id = %s 
        ORDER BY start_time ASC
    """, (room_id,))

    # Recent telemetry history for graphs
    history = query_all("""
        SELECT occupancy, temperature, power_watts, recorded_at 
        FROM telemetry_history 
        WHERE room_id = %s 
        ORDER BY recorded_at DESC LIMIT 20
    """, (room_id,))

    # Active / Next upcoming booking
    active_booking = query_one("""
        SELECT * FROM bookings 
        WHERE room_id = %s AND booking_date = CURDATE() AND status IN ('CONFIRMED', 'CHECKED_IN')
        ORDER BY start_time ASC LIMIT 1
    """, (room_id,))

    return jsonify({
        "room": room,
        "equipment": equipment,
        "schedules": schedules,
        "history": list(reversed(history)),
        "active_booking": active_booking
    })
