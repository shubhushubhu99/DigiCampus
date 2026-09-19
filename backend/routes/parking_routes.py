import random
from flask import Blueprint, jsonify, request
from db import query_all, query_one, execute_write
from services.iot_service import iot_service

parking_bp = Blueprint("parking", __name__)

@parking_bp.route("/api/parking", methods=["GET"])
def get_parking_overview():
    zones = query_all("SELECT * FROM parking_zones")
    slots = query_all("""
        SELECT s.*, z.name as zone_name, z.code as zone_code
        FROM parking_slots s
        JOIN parking_zones z ON s.zone_id = z.id
        ORDER BY z.id, s.slot_number
    """)

    # Group slots by zone
    zones_map = {z["id"]: {**z, "slots": []} for z in zones}
    for s in slots:
        if s["zone_id"] in zones_map:
            zones_map[s["zone_id"]]["slots"].append(s)

    stats = query_one("""
        SELECT 
            COUNT(*) as total_slots,
            SUM(CASE WHEN is_occupied = TRUE THEN 1 ELSE 0 END) as occupied_count,
            SUM(CASE WHEN is_occupied = FALSE THEN 1 ELSE 0 END) as available_count,
            SUM(CASE WHEN type = 'EV_CHARGING' THEN 1 ELSE 0 END) as ev_total,
            SUM(CASE WHEN type = 'EV_CHARGING' AND is_occupied = TRUE THEN 1 ELSE 0 END) as ev_occupied
        FROM parking_slots
    """)

    return jsonify({
        "stats": {
            "total_slots": int(stats["total_slots"] or 0),
            "occupied_count": int(stats["occupied_count"] or 0),
            "available_count": int(stats["available_count"] or 0),
            "ev_total": int(stats["ev_total"] or 0),
            "ev_occupied": int(stats["ev_occupied"] or 0),
            "utilization_pct": round(float(stats["occupied_count"] or 0) / max(1, float(stats["total_slots"] or 1)) * 100, 1)
        },
        "zones": list(zones_map.values())
    })

@parking_bp.route("/api/parking/toggle-slot", methods=["POST"])
def toggle_slot():
    data = request.get_json() or {}
    slot_id = data.get("slot_id")
    plate = data.get("plate")

    slot = query_one("SELECT * FROM parking_slots WHERE id = %s", (slot_id,))
    if not slot:
        return jsonify({"error": "Slot not found"}), 404

    new_occupied = not slot["is_occupied"]
    new_plate = plate if new_occupied else None
    if new_occupied and not new_plate:
        new_plate = f"KA-{random.randint(10,99)}-{random.choice(['AA','BB','CC','EV'])}-{random.randint(1000,9999)}"

    execute_write("""
        UPDATE parking_slots 
        SET is_occupied = %s, vehicle_plate = %s, last_updated = NOW() 
        WHERE id = %s
    """, (new_occupied, new_plate, slot_id))

    updated_slot = query_one("SELECT * FROM parking_slots WHERE id = %s", (slot_id,))
    iot_service.broadcast("parking_slot_updated", updated_slot)

    return jsonify({"success": True, "slot": updated_slot})
