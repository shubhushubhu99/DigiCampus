export interface Campus {
  id: number;
  name: string;
  code: string;
  description: string;
  city: string;
  total_area_acres: number;
  created_at?: string;
}

export interface CampusMetrics {
  total_occupants: number;
  total_capacity: number;
  occupancy_rate: number;
  total_power_kw: number;
  total_rooms: number;
  active_rooms: number;
  total_online_pcs: number;
  total_pcs: number;
  parking: {
    total: number;
    occupied: number;
    available: number;
    ev_charging: number;
  };
}

export interface Building {
  id: number;
  campus_id: number;
  code: string;
  name: string;
  type: string;
  total_floors: number;
  description: string;
  pos_x: number;
  pos_y: number;
  color: string;
  room_count?: number;
  current_occupancy?: number;
  capacity?: number;
  power_watts?: number;
}

export interface Floor {
  id: number;
  building_id: number;
  floor_number: number;
  name: string;
}

export interface Room {
  id: number;
  building_id: number;
  floor_id: number;
  room_number: string;
  name: string;
  type: string;
  capacity: number;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
  has_projector: boolean;
  has_ac: boolean;
  has_smartboard: boolean;
  qr_code_token?: string;
  building_name?: string;
  building_code?: string;
  floor_number?: number;
  floor_name?: string;
  // Telemetry properties joined
  current_occupancy?: number;
  temperature?: number;
  humidity?: number;
  power_watts?: number;
  lights_status?: 'ON' | 'OFF' | string;
  ac_status?: 'ON' | 'OFF' | string;
  ac_set_temp?: number;
  computers_online?: number;
  computers_total?: number;
  air_quality_aqi?: number;
  noise_db?: number;
  network_status?: string;
  telemetry_updated_at?: string;
}

export interface Equipment {
  id: number;
  room_id: number;
  device_name: string;
  type: string;
  status: 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'MAINTENANCE' | string;
  ip_address: string;
  mac_address: string;
  specs_summary: string;
  last_ping: string;
  room_number?: string;
  room_name?: string;
  building_name?: string;
}

export interface Schedule {
  id: number;
  room_id: number;
  title: string;
  instructor: string;
  type: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
}

export interface Booking {
  id: number;
  room_id: number;
  title: string;
  booked_by_name: string;
  booked_by_email: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  attendees_count: number;
  qr_token: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'COMPLETED' | string;
  created_at: string;
  room_number?: string;
  room_name?: string;
  building_name?: string;
}

export interface ParkingSlot {
  id: number;
  zone_id: number;
  slot_number: string;
  type: 'STANDARD' | 'EV_CHARGING' | 'HANDICAP' | 'FACULTY' | 'TWO_WHEELER' | string;
  is_occupied: boolean;
  vehicle_plate: string | null;
  last_updated: string;
  zone_name?: string;
}

export interface ParkingZone {
  id: number;
  campus_id: number;
  name: string;
  code: string;
  pos_x: number;
  pos_y: number;
  total_slots: number;
  slots: ParkingSlot[];
}

export interface ParkingOverview {
  stats: {
    total_slots: number;
    occupied_count: number;
    available_count: number;
    ev_total: number;
    ev_occupied: number;
    utilization_pct: number;
  };
  zones: ParkingZone[];
}

export interface AIRecommendation {
  id: number;
  category: 'REALLOCATION' | 'ENERGY_SAVER' | 'CAPACITY_WARNING' | 'IOT_ANOMALY' | 'PARKING';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  impacted_room_id?: number | null;
  suggested_room_id?: number | null;
  suggested_action?: string;
  is_applied: boolean;
  created_at: string;
  impacted_room_number?: string;
  impacted_room_name?: string;
  suggested_room_number?: string;
  suggested_room_name?: string;
}

export interface IoTLog {
  id: number;
  topic: string;
  device_uid: string;
  payload: any;
  received_at: string;
}
