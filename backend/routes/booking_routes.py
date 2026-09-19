import secrets
import datetime
from flask import Blueprint, jsonify, request
from db import query_all, query_one, execute_write
from services.iot_service import iot_service

booking_bp = Blueprint("booking", __name__)

@booking_bp.route("/api/bookings", methods=["GET"])
def get_bookings():
    room_id = request.args.get("room_id")
    date = request.args.get("date")

    sql = """
        SELECT b.*, r.room_number, r.name as room_name, r.capacity,
               bld.name as building_name
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN buildings bld ON r.building_id = bld.id
        WHERE 1=1
    """
    params = []
    if room_id:
        sql += " AND b.room_id = %s"
        params.append(room_id)
    if date:
        sql += " AND b.booking_date = %s"
        params.append(date)

    sql += " ORDER BY b.booking_date DESC, b.start_time DESC"
    bookings = query_all(sql, params)
    return jsonify(bookings)

@booking_bp.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json() or {}
    room_id = data.get("room_id")
    title = data.get("title")
    booked_by_name = data.get("booked_by_name")
    booked_by_email = data.get("booked_by_email")
    booking_date = data.get("booking_date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    attendees_count = int(data.get("attendees_count", 1))

    if not all([room_id, title, booked_by_name, booked_by_email, booking_date, start_time, end_time]):
        return jsonify({"error": "Missing required booking details"}), 400

    room = query_one("SELECT * FROM rooms WHERE id = %s", (room_id,))
    if not room:
        return jsonify({"error": "Selected room does not exist"}), 404

    if attendees_count > room["capacity"]:
        return jsonify({"error": f"Attendees count ({attendees_count}) exceeds room capacity ({room['capacity']})"}), 400

    # Clash detection
    conflict = query_one("""
        SELECT * FROM bookings 
        WHERE room_id = %s 
          AND booking_date = %s 
          AND status IN ('CONFIRMED', 'CHECKED_IN')
          AND NOT (end_time <= %s OR start_time >= %s)
    """, (room_id, booking_date, start_time, end_time))

    if conflict:
        return jsonify({"error": f"Time clash with existing reservation '{conflict['title']}' ({conflict['start_time']} - {conflict['end_time']})"}), 409

    qr_token = f"QR-DIGI-{datetime.date.today().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"

    booking_id = execute_write("""
        INSERT INTO bookings (room_id, title, booked_by_name, booked_by_email, booking_date, start_time, end_time, attendees_count, qr_token, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'CONFIRMED')
    """, (room_id, title, booked_by_name, booked_by_email, booking_date, start_time, end_time, attendees_count, qr_token))

    created = query_one("""
        SELECT b.*, r.room_number, r.name as room_name, bld.name as building_name
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN buildings bld ON r.building_id = bld.id
        WHERE b.id = %s
    """, (booking_id,))

    iot_service.broadcast("booking_created", created)
    return jsonify({"success": True, "booking": created}), 201

@booking_bp.route("/api/bookings/check-in", methods=["POST"])
def check_in():
    data = request.get_json() or {}
    qr_token = data.get("qr_token")

    if not qr_token:
        return jsonify({"error": "Missing qr_token"}), 400

    booking = query_one("""
        SELECT b.*, r.name as room_name, r.room_number, r.capacity,
               t.current_occupancy
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN telemetry_live t ON r.id = t.room_id
        WHERE b.qr_token = %s
    """, (qr_token,))

    if not booking:
        return jsonify({"error": "Invalid QR Token or booking not found"}), 404

    if booking["status"] == "CHECKED_IN":
        return jsonify({"message": "Already checked in!", "booking": booking}), 200

    execute_write("UPDATE bookings SET status = 'CHECKED_IN' WHERE id = %s", (booking["id"],))
    
    # Simulate presence: bump room occupancy by attendees count (capped by capacity)
    new_occ = min(booking["capacity"], booking["current_occupancy"] + booking["attendees_count"])
    execute_write("UPDATE telemetry_live SET current_occupancy = %s, lights_status = 'ON', ac_status = 'ON' WHERE room_id = %s", (new_occ, booking["room_id"]))

    booking["status"] = "CHECKED_IN"
    booking["current_occupancy"] = new_occ

    iot_service.broadcast("booking_checked_in", booking)
    return jsonify({"success": True, "message": f"Checked in successfully for {booking['title']} in {booking['room_number']}", "booking": booking})
