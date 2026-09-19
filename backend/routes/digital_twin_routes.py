import json
import time
from flask import Blueprint, Response, request, jsonify
from services.iot_service import iot_service
from db import query_all

twin_bp = Blueprint("digital_twin", __name__)

@twin_bp.route("/api/digital-twin/stream")
def sse_stream():
    """Server-Sent Events endpoint pushing live campus telemetry changes to frontend"""
    def event_generator():
        client_queue = iot_service.subscribe()
        try:
            # Send initial handshake
            yield f"event: connected\ndata: {json.dumps({'status': 'stream_connected', 'timestamp': time.time()})}\n\n"
            
            while True:
                try:
                    # Wait for next event from queue
                    message = client_queue.get(timeout=20.0)
                    yield f"event: {message['event']}\ndata: {json.dumps(message['data'])}\n\n"
                except Exception:
                    # Keep-alive heartbeat
                    yield f"event: heartbeat\ndata: {json.dumps({'time': time.time()})}\n\n"
        except GeneratorExit:
            pass
        finally:
            iot_service.unsubscribe(client_queue)

    return Response(event_generator(), mimetype="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    })

@twin_bp.route("/api/digital-twin/control", methods=["POST"])
def update_control():
    data = request.get_json() or {}
    room_id = data.get("room_id")
    device_type = data.get("device_type")  # 'lights', 'ac', 'occupancy', 'temp'
    state = data.get("state")

    if not room_id or not device_type or state is None:
        return jsonify({"error": "Missing room_id, device_type, or state"}), 400

    updated = iot_service.toggle_device_control(room_id, device_type, state)
    return jsonify({
        "success": True,
        "message": f"Updated {device_type} in room {room_id} to {state}",
        "room": updated
    })

@twin_bp.route("/api/digital-twin/logs", methods=["GET"])
def get_iot_logs():
    logs = query_all("SELECT * FROM iot_message_logs ORDER BY received_at DESC LIMIT 30")
    for log in logs:
        if isinstance(log.get("payload"), str):
            try:
                log["payload"] = json.loads(log["payload"])
            except Exception:
                pass
    return jsonify(logs)
