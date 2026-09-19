import time
import random
import json
import threading
import queue
from db import get_db, query_all, execute_write

class IoTService:
    def __init__(self):
        self.subscribers = []
        self.subscribers_lock = threading.Lock()
        self.is_running = False
        self.worker_thread = None

    def subscribe(self):
        q = queue.Queue(maxsize=50)
        with self.subscribers_lock:
            self.subscribers.append(q)
        return q

    def unsubscribe(self, q):
        with self.subscribers_lock:
            if q in self.subscribers:
                self.subscribers.remove(q)

    def broadcast(self, event_name, data):
        message = {
            "event": event_name,
            "data": data,
            "timestamp": time.time()
        }
        with self.subscribers_lock:
            dead_queues = []
            for q in self.subscribers:
                try:
                    q.put_nowait(message)
                except queue.Full:
                    dead_queues.append(q)
            for dead in dead_queues:
                if dead in self.subscribers:
                    self.subscribers.remove(dead)

    def start_simulation(self):
        if self.is_running:
            return
        self.is_running = True
        self.worker_thread = threading.Thread(target=self._simulation_loop, daemon=True)
        self.worker_thread.start()

    def _simulation_loop(self):
        while self.is_running:
            try:
                time.sleep(3)  # broadcast tick every 3s
                self._tick()
            except Exception as e:
                print(f"[IoT Simulation Error]: {e}")
                time.sleep(2)

    def _tick(self):
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Fetch random active rooms to introduce micro-variations
                cursor.execute("""
                    SELECT r.id, r.room_number, r.name, r.capacity,
                           t.current_occupancy, t.temperature, t.humidity,
                           t.power_watts, t.lights_status, t.ac_status,
                           t.computers_online, t.computers_total
                    FROM rooms r
                    JOIN telemetry_live t ON r.id = t.room_id
                """)
                rooms = cursor.fetchall()

                if not rooms:
                    return

                # Pick 2-3 rooms to update
                sample_rooms = random.sample(rooms, min(len(rooms), 3))
                updated_nodes = []

                for rm in sample_rooms:
                    room_id = rm["id"]
                    curr_occ = rm["current_occupancy"]
                    curr_temp = float(rm["temperature"])
                    curr_watts = rm["power_watts"]
                    curr_pcs = rm["computers_online"]
                    total_pcs = rm["computers_total"]

                    # Realistic jitter
                    temp_delta = round(random.uniform(-0.2, 0.2), 1)
                    new_temp = max(18.0, min(32.0, round(curr_temp + temp_delta, 1)))

                    # Random slight occupancy fluctuation if room is active
                    if curr_occ > 0:
                        occ_delta = random.choice([-1, 0, 0, 1])
                        new_occ = max(0, min(rm["capacity"], curr_occ + occ_delta))
                    else:
                        new_occ = 0

                    # Adjust power based on occupancy & lights
                    base_power = 150 if rm["lights_status"] == 'OFF' else 800
                    ac_power = 1200 if rm["ac_status"] == 'ON' else 50
                    pc_power = new_occ * 45
                    new_watts = base_power + ac_power + pc_power + random.randint(-40, 40)

                    # Update database
                    cursor.execute("""
                        UPDATE telemetry_live
                        SET temperature = %s,
                            current_occupancy = %s,
                            power_watts = %s,
                            updated_at = NOW()
                        WHERE room_id = %s
                    """, (new_temp, new_occ, new_watts, room_id))

                    # Periodic history log (10% chance)
                    if random.random() < 0.15:
                        cursor.execute("""
                            INSERT INTO telemetry_history (room_id, occupancy, temperature, power_watts)
                            VALUES (%s, %s, %s, %s)
                        """, (room_id, new_occ, new_temp, new_watts))

                    # Mock MQTT packet
                    mqtt_payload = {
                        "device_id": f"ESP32-NODE-{rm['room_number']}",
                        "room_id": room_id,
                        "temp_c": new_temp,
                        "occupancy": new_occ,
                        "power_w": new_watts,
                        "source": "ESP32_MQTT_BROKER"
                    }
                    cursor.execute("""
                        INSERT INTO iot_message_logs (topic, device_uid, payload)
                        VALUES (%s, %s, %s)
                    """, (f"campus/telemetry/{rm['room_number']}", f"ESP32-{rm['room_number']}", json.dumps(mqtt_payload)))

                    updated_nodes.append({
                        "room_id": room_id,
                        "room_number": rm["room_number"],
                        "name": rm["name"],
                        "temperature": new_temp,
                        "occupancy": new_occ,
                        "power_watts": new_watts,
                        "lights_status": rm["lights_status"],
                        "ac_status": rm["ac_status"],
                        "computers_online": curr_pcs,
                        "computers_total": total_pcs,
                        "mqtt_packet": mqtt_payload
                    })

                # Broadcast to SSE clients
                self.broadcast("telemetry_update", updated_nodes)

    def toggle_device_control(self, room_id, device_type, state):
        with get_db() as conn:
            with conn.cursor() as cursor:
                if device_type == "lights":
                    cursor.execute("UPDATE telemetry_live SET lights_status = %s WHERE room_id = %s", (state, room_id))
                elif device_type == "ac":
                    cursor.execute("UPDATE telemetry_live SET ac_status = %s WHERE room_id = %s", (state, room_id))
                elif device_type == "occupancy":
                    cursor.execute("UPDATE telemetry_live SET current_occupancy = %s WHERE room_id = %s", (int(state), room_id))
                elif device_type == "temp":
                    cursor.execute("UPDATE telemetry_live SET temperature = %s WHERE room_id = %s", (float(state), room_id))
                
                # Fetch updated room
                cursor.execute("""
                    SELECT r.id, r.room_number, r.name, r.capacity,
                           t.current_occupancy, t.temperature, t.humidity,
                           t.power_watts, t.lights_status, t.ac_status,
                           t.computers_online, t.computers_total
                    FROM rooms r
                    JOIN telemetry_live t ON r.id = t.room_id
                    WHERE r.id = %s
                """, (room_id,))
                updated = cursor.fetchone()
                if updated:
                    self.broadcast("control_changed", updated)
                return updated

iot_service = IoTService()
