import { 
  Campus, CampusMetrics, Building, Room, Equipment, 
  Booking, ParkingOverview, ParkingSlot, AIRecommendation, IoTLog 
} from '../types/campus';

const API_BASE = '/api';

export const api = {
  // Campus & Map
  async getCampusOverview(): Promise<{ campus: Campus; metrics: CampusMetrics; buildings: Building[] }> {
    const res = await fetch(`${API_BASE}/campus`);
    if (!res.ok) throw new Error('Failed to fetch campus overview');
    return res.json();
  },

  async getBuildings(): Promise<Building[]> {
    const res = await fetch(`${API_BASE}/buildings`);
    if (!res.ok) throw new Error('Failed to fetch buildings');
    return res.json();
  },

  async getBuildingDetails(id: number): Promise<{ building: Building; floors: any[]; rooms: Room[] }> {
    const res = await fetch(`${API_BASE}/buildings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch building details');
    return res.json();
  },

  // Rooms & Digital Twin
  async getRooms(filters?: { building_id?: number; type?: string; q?: string }): Promise<Room[]> {
    const params = new URLSearchParams();
    if (filters?.building_id) params.append('building_id', filters.building_id.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.q) params.append('q', filters.q);
    const res = await fetch(`${API_BASE}/rooms?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },

  async getRoomDigitalTwin(roomId: number): Promise<{
    room: Room;
    equipment: Equipment[];
    schedules: any[];
    history: any[];
    active_booking: Booking | null;
  }> {
    const res = await fetch(`${API_BASE}/rooms/${roomId}`);
    if (!res.ok) throw new Error('Failed to fetch digital twin room');
    return res.json();
  },

  async toggleDeviceControl(roomId: number, deviceType: 'lights' | 'ac' | 'occupancy' | 'temp', state: any) {
    const res = await fetch(`${API_BASE}/digital-twin/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, device_type: deviceType, state })
    });
    if (!res.ok) throw new Error('Failed to execute device control');
    return res.json();
  },

  // Bookings & QR
  async getBookings(roomId?: number, date?: string): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (roomId) params.append('room_id', roomId.toString());
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async createBooking(data: {
    room_id: number;
    title: string;
    booked_by_name: string;
    booked_by_email: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    attendees_count: number;
  }): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create booking');
    return result;
  },

  async checkInBooking(qrToken: string): Promise<{ success: boolean; message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_token: qrToken })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Check-in failed');
    return result;
  },

  // Parking
  async getParking(): Promise<ParkingOverview> {
    const res = await fetch(`${API_BASE}/parking`);
    if (!res.ok) throw new Error('Failed to fetch parking overview');
    return res.json();
  },

  async toggleParkingSlot(slotId: number, plate?: string): Promise<{ success: boolean; slot: ParkingSlot }> {
    const res = await fetch(`${API_BASE}/parking/toggle-slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId, plate })
    });
    if (!res.ok) throw new Error('Failed to toggle parking slot');
    return res.json();
  },

  // Equipment
  async getEquipment(filters?: { room_id?: number; type?: string; status?: string }): Promise<Equipment[]> {
    const params = new URLSearchParams();
    if (filters?.room_id) params.append('room_id', filters.room_id.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/equipment?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch equipment');
    return res.json();
  },

  // AI Optimizer
  async getAIRecommendations(): Promise<AIRecommendation[]> {
    const res = await fetch(`${API_BASE}/ai/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch AI recommendations');
    return res.json();
  },

  async evaluateAIOptimizations(): Promise<{ success: boolean; recommendations: AIRecommendation[] }> {
    const res = await fetch(`${API_BASE}/ai/evaluate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to evaluate AI optimizations');
    return res.json();
  },

  async applyAIRecommendation(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/ai/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Failed to apply recommendation');
    return res.json();
  },

  // IoT Logs
  async getIoTLogs(): Promise<IoTLog[]> {
    const res = await fetch(`${API_BASE}/digital-twin/logs`);
    if (!res.ok) throw new Error('Failed to fetch IoT logs');
    return res.json();
  },

  // SSE Stream
  connectTelemetryStream(onEvent: (event: string, data: any) => void): () => void {
    const eventSource = new EventSource(`${API_BASE}/digital-twin/stream`);

    const handleEvent = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(e.type || 'message', parsed);
      } catch (err) {
        console.error('SSE JSON error', err);
      }
    };

    eventSource.addEventListener('telemetry_update', handleEvent);
    eventSource.addEventListener('control_changed', handleEvent);
    eventSource.addEventListener('recommendation_applied', handleEvent);
    eventSource.addEventListener('parking_slot_updated', handleEvent);
    eventSource.addEventListener('booking_checked_in', handleEvent);
    eventSource.addEventListener('booking_created', handleEvent);

    return () => {
      eventSource.close();
    };
  }
};
