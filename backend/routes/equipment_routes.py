from flask import Blueprint, jsonify, request
from db import query_all, query_one, execute_write

equipment_bp = Blueprint("equipment", __name__)

@equipment_bp.route("/api/equipment", methods=["GET"])
def get_equipment():
    room_id = request.args.get("room_id")
    eq_type = request.args.get("type")
    status = request.args.get("status")

    sql = """
        SELECT e.*, r.room_number, r.name as room_name, b.name as building_name
        FROM equipment e
        JOIN rooms r ON e.room_id = r.id
        JOIN buildings b ON r.building_id = b.id
        WHERE 1=1
    """
    params = []
    if room_id:
        sql += " AND e.room_id = %s"
        params.append(room_id)
    if eq_type:
        sql += " AND e.type = %s"
        params.append(eq_type)
    if status:
        sql += " AND e.status = %s"
        params.append(status)

    sql += " ORDER BY e.status ASC, e.device_name ASC"
    devices = query_all(sql, params)
    return jsonify(devices)

@equipment_bp.route("/api/equipment/<int:device_id>/status", methods=["POST"])
def update_equipment_status(device_id):
    data = request.get_json() or {}
    status = data.get("status")

    if not status:
        return jsonify({"error": "Missing status"}), 400

    execute_write("UPDATE equipment SET status = %s, last_ping = NOW() WHERE id = %s", (status, device_id))
    device = query_one("SELECT * FROM equipment WHERE id = %s", (device_id,))
    return jsonify({"success": True, "device": device})
