from db import get_db, query_all, query_one, execute_write
from services.iot_service import iot_service

class AIService:
    def get_recommendations(self):
        sql = """
            SELECT ar.*, 
                   r1.room_number as impacted_room_number, r1.name as impacted_room_name,
                   r2.room_number as suggested_room_number, r2.name as suggested_room_name
            FROM ai_recommendations ar
            LEFT JOIN rooms r1 ON ar.impacted_room_id = r1.id
            LEFT JOIN rooms r2 ON ar.suggested_room_id = r2.id
            ORDER BY ar.is_applied ASC, 
                     FIELD(ar.priority, 'HIGH', 'MEDIUM', 'LOW'), 
                     ar.created_at DESC
        """
        return query_all(sql)

    def evaluate_optimizations(self):
        """AI Engine rule evaluator to discover fresh energy & space optimizations"""
        recommendations_added = []
        with get_db() as conn:
            with conn.cursor() as cursor:
                # 1. Energy Saver Check: Rooms with 0 occupancy but lights or AC are ON
                cursor.execute("""
                    SELECT r.id, r.room_number, r.name, t.power_watts, t.lights_status, t.ac_status
                    FROM rooms r
                    JOIN telemetry_live t ON r.id = t.room_id
                    WHERE t.current_occupancy = 0 AND (t.lights_status = 'ON' OR t.ac_status = 'ON')
                """)
                idle_rooms = cursor.fetchall()

                for rm in idle_rooms:
                    # Check if already recommended
                    cursor.execute("""
                        SELECT id FROM ai_recommendations 
                        WHERE impacted_room_id = %s AND category = 'ENERGY_SAVER' AND is_applied = FALSE
                    """, (rm["id"],))
                    if not cursor.fetchone():
                        title = f"Eco-Saver Trigger: {rm['room_number']} Idle Power Cut"
                        desc = f"{rm['name']} has 0 detected headcount while consuming {rm['power_watts']}W. Auto-standby can save ~{rm['power_watts'] - 50}W."
                        cursor.execute("""
                            INSERT INTO ai_recommendations (category, priority, title, description, impacted_room_id, suggested_action)
                            VALUES ('ENERGY_SAVER', 'MEDIUM', %s, %s, %s, 'Turn off idle lights & AC')
                        """, (title, desc, rm["id"]))
                        recommendations_added.append(title)

                # 2. Reallocation Check: Lab with >75% capacity vs Lab with <20% capacity
                cursor.execute("""
                    SELECT r.id, r.room_number, r.name, r.capacity, t.current_occupancy, t.temperature, t.power_watts
                    FROM rooms r
                    JOIN telemetry_live t ON r.id = t.room_id
                    WHERE r.type IN ('computer_lab', 'ai_robotics_lab')
                    ORDER BY (t.current_occupancy / r.capacity) DESC
                """)
                lab_stats = cursor.fetchall()
                if len(lab_stats) >= 2:
                    crowded = lab_stats[0]
                    empty = lab_stats[-1]
                    crowded_ratio = crowded["current_occupancy"] / crowded["capacity"] if crowded["capacity"] > 0 else 0
                    empty_ratio = empty["current_occupancy"] / empty["capacity"] if empty["capacity"] > 0 else 0

                    if crowded_ratio > 0.70 and empty_ratio < 0.30:
                        cursor.execute("""
                            SELECT id FROM ai_recommendations 
                            WHERE impacted_room_id = %s AND category = 'REALLOCATION' AND is_applied = FALSE
                        """, (crowded["id"],))
                        if not cursor.fetchone():
                            title = f"AI Reallocation: Balance {crowded['room_number']} into {empty['room_number']}"
                            desc = f"{crowded['room_number']} is at {round(crowded_ratio*100)}% load ({crowded['current_occupancy']}/{crowded['capacity']}). Reallocating upcoming session to {empty['room_number']} ({empty['current_occupancy']}/{empty['capacity']}) balances thermal dissipation and saves energy."
                            cursor.execute("""
                                INSERT INTO ai_recommendations (category, priority, title, description, impacted_room_id, suggested_room_id, suggested_action)
                                VALUES ('REALLOCATION', 'HIGH', %s, %s, %s, %s, 'Migrate session schedule & notify students')
                            """, (title, desc, crowded["id"], empty["id"]))
                            recommendations_added.append(title)

        iot_service.broadcast("ai_analysis_completed", {"new_recommendations": recommendations_added})
        return self.get_recommendations()

    def apply_recommendation(self, rec_id):
        rec = query_one("SELECT * FROM ai_recommendations WHERE id = %s", (rec_id,))
        if not rec:
            return {"error": "Recommendation not found"}, 404

        with get_db() as conn:
            with conn.cursor() as cursor:
                # Mark as applied
                cursor.execute("UPDATE ai_recommendations SET is_applied = TRUE WHERE id = %s", (rec_id,))

                # Execute action based on category
                if rec["category"] == "ENERGY_SAVER" and rec["impacted_room_id"]:
                    cursor.execute("""
                        UPDATE telemetry_live 
                        SET lights_status = 'OFF', ac_status = 'OFF', power_watts = 60
                        WHERE room_id = %s
                    """, (rec["impacted_room_id"],))

                elif rec["category"] == "REALLOCATION" and rec["impacted_room_id"] and rec["suggested_room_id"]:
                    # Swap or move upcoming booking/schedule
                    cursor.execute("""
                        UPDATE bookings 
                        SET room_id = %s 
                        WHERE room_id = %s AND status = 'CONFIRMED'
                    """, (rec["suggested_room_id"], rec["impacted_room_id"]))

                    # Rebalance occupancies slightly in telemetry
                    cursor.execute("""
                        UPDATE telemetry_live SET current_occupancy = GREATEST(0, current_occupancy - 15) WHERE room_id = %s
                    """, (rec["impacted_room_id"],))
                    cursor.execute("""
                        UPDATE telemetry_live SET current_occupancy = current_occupancy + 15 WHERE room_id = %s
                    """, (rec["suggested_room_id"],))

        iot_service.broadcast("recommendation_applied", {"id": rec_id, "category": rec["category"]})
        return {"success": True, "message": f"Successfully executed: {rec['title']}"}

ai_service = AIService()
