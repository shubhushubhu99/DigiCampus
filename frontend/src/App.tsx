import React, { useState, useEffect } from 'react';
import { Campus, CampusMetrics, Building, Room } from './types/campus';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { CampusMap } from './components/CampusMap';
import { SmartLabMonitor } from './components/SmartLabMonitor';
import { BookingAndQRView } from './components/BookingAndQRView';
import { SmartParkingTwin } from './components/SmartParkingTwin';
import { AIOptimizerView } from './components/AIOptimizerView';
import { IoTFleetView } from './components/IoTFleetView';
import { RoomDigitalTwinModal } from './components/RoomDigitalTwinModal';
import { 
  Building2, 
  Cpu, 
  Calendar, 
  Car, 
  Sparkles, 
  Radio, 
  AlertCircle 
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [campus, setCampus] = useState<Campus | null>(null);
  const [metrics, setMetrics] = useState<CampusMetrics | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);

  // Digital Twin Modal State
  const [inspectedRoomId, setInspectedRoomId] = useState<number | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(1);
  const [bookingPreselectRoomId, setBookingPreselectRoomId] = useState<number | null>(null);

  const loadInitialData = async () => {
    try {
      setError(null);
      const [campusData, roomsData] = await Promise.all([
        api.getCampusOverview(),
        api.getRooms()
      ]);
      setCampus(campusData.campus);
      setMetrics(campusData.metrics);
      setBuildings(campusData.buildings);
      setRooms(roomsData);
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError('Unable to reach DigiCampus backend. Ensure Flask is running on port 5000 and MySQL is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Connect to Server-Sent Events (SSE) stream for live updates
    const disconnectStream = api.connectTelemetryStream((event, data) => {
      setIsStreamActive(true);

      if (event === 'telemetry_update' && Array.isArray(data)) {
        // Update rooms in state with incoming telemetry
        setRooms((prevRooms) => {
          const map = new Map(data.map((item) => [item.room_id, item]));
          return prevRooms.map((rm) => {
            if (map.has(rm.id)) {
              const u = map.get(rm.id);
              return {
                ...rm,
                temperature: u.temperature,
                current_occupancy: u.occupancy,
                power_watts: u.power_watts,
                lights_status: u.lights_status,
                ac_status: u.ac_status,
                computers_online: u.computers_online,
                computers_total: u.computers_total
              };
            }
            return rm;
          });
        });

        // Refresh aggregate metrics periodically
        api.getCampusOverview().then((res) => {
          setMetrics(res.metrics);
          setBuildings(res.buildings);
        }).catch(() => {});
      } else if (event === 'control_changed' || event === 'booking_checked_in' || event === 'recommendation_applied') {
        // Instant full refresh on state modifications
        loadInitialData();
      }
    });

    return () => {
      disconnectStream();
    };
  }, []);

  const handleOpenBooking = (roomId: number) => {
    setBookingPreselectRoomId(roomId);
    setInspectedRoomId(null);
    setActiveTab('bookings');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        isStreamActive={isStreamActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadInitialData}
              className="px-3 py-1 bg-rose-900/50 hover:bg-rose-900 rounded-lg text-white font-semibold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40">
              <Cpu className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 font-mono">Initializing DigiCampus Digital Twin Subsystems...</p>
          </div>
        ) : (
          <>
            {activeTab === 'map' && (
              <CampusMap
                buildings={buildings}
                allRooms={rooms}
                selectedBuildingId={selectedBuildingId}
                setSelectedBuildingId={setSelectedBuildingId}
                onSelectRoom={(id) => setInspectedRoomId(id)}
              />
            )}

            {activeTab === 'labs' && (
              <SmartLabMonitor
                rooms={rooms}
                onSelectRoom={(id) => setInspectedRoomId(id)}
                onNavigateToAI={() => setActiveTab('ai')}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingAndQRView
                rooms={rooms}
                initialRoomId={bookingPreselectRoomId}
              />
            )}

            {activeTab === 'parking' && (
              <SmartParkingTwin />
            )}

            {activeTab === 'ai' && (
              <AIOptimizerView />
            )}

            {activeTab === 'iot' && (
              <IoTFleetView rooms={rooms} />
            )}
          </>
        )}
      </main>

      {/* Digital Twin Deep Inspector Modal */}
      {inspectedRoomId !== null && (
        <RoomDigitalTwinModal
          roomId={inspectedRoomId}
          onClose={() => setInspectedRoomId(null)}
          onOpenBooking={handleOpenBooking}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-[11px] text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <span>DigiCampus Digital Twin Platform &bull; React TypeScript + Flask + MySQL</span>
          <span className="font-mono text-[10px] text-cyan-400">
            Node: LAB-204 Live Sync &bull; AI Reallocation Ready
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
