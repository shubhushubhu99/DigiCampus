import React, { useState, useEffect } from 'react';
import { 
  Room, 
  Equipment, 
  Schedule, 
  Booking 
} from '../types/campus';
import { api } from '../services/api';
import { 
  X, 
  Users, 
  Lightbulb, 
  Thermometer, 
  Monitor, 
  Clock, 
  Zap, 
  Wifi, 
  ShieldCheck, 
  Sliders, 
  QrCode, 
  HardDrive, 
  Calendar, 
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RoomDigitalTwinModalProps {
  roomId: number | null;
  onClose: () => void;
  onOpenBooking: (roomId: number) => void;
}

export const RoomDigitalTwinModal: React.FC<RoomDigitalTwinModalProps> = ({
  roomId,
  onClose,
  onOpenBooking
}) => {
  const [data, setData] = useState<{
    room: Room;
    equipment: Equipment[];
    schedules: Schedule[];
    history: any[];
    active_booking: Booking | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [controlling, setControlling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchTwin = async () => {
    if (!roomId) return;
    try {
      const res = await api.getRoomDigitalTwin(roomId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwin();
    // Poll or sync
    const timer = setInterval(fetchTwin, 3000);
    return () => clearInterval(timer);
  }, [roomId]);

  if (!roomId) return null;

  const handleToggleDevice = async (deviceType: 'lights' | 'ac', currentState: string) => {
    setControlling(true);
    const newState = currentState === 'ON' ? 'OFF' : 'ON';
    try {
      await api.toggleDeviceControl(roomId, deviceType, newState);
      setActionSuccess(`Command Dispatched: ${deviceType.toUpperCase()} set to ${newState}`);
      await fetchTwin();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setControlling(false);
    }
  };

  const handleAdjustOccupancy = async (delta: number) => {
    if (!data) return;
    const current = data.room.current_occupancy ?? 0;
    const next = Math.max(0, Math.min(data.room.capacity, current + delta));
    try {
      await api.toggleDeviceControl(roomId, 'occupancy', next);
      await fetchTwin();
    } catch (err) {
      console.error(err);
    }
  };

  const room = data?.room;
  const computersOnline = room?.computers_online ?? 0;
  const computersTotal = room?.computers_total ?? 40;

  // Render 40 workstation boxes
  const workstations = Array.from({ length: computersTotal }, (_, i) => ({
    id: i + 1,
    isOnline: i < computersOnline,
    ip: `192.168.10.${100 + i + 1}`
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 overflow-hidden my-8">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping"></div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-black text-cyan-400">{room?.room_number ?? 'LOADING...'}</span>
                <span className="text-sm font-bold text-white">&bull; {room?.name}</span>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-[10px] px-2 py-0.5 rounded font-mono">
                  DIGITAL TWIN LIVE NODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {room?.building_name} &bull; Floor {room?.floor_number} ({room?.type})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenBooking(roomId)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Book Space</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action feedback toast */}
        {actionSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2 flex items-center space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading && !data ? (
            <div className="text-center py-20 text-slate-400 text-sm animate-pulse">
              Synchronizing edge telemetry from ESP32 broker...
            </div>
          ) : (
            <>
              {/* PRIMARY STATS GRID (The Exact Example from Idea 2.docx) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* 1. Occupancy */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <span>Occupancy</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">PIR/Cam</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {room?.current_occupancy} <span className="text-sm font-normal text-slate-500">/ {room?.capacity}</span>
                  </div>
                  {/* Visual occupancy meter */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((room?.current_occupancy ?? 0) / (room?.capacity ?? 1)) * 100)}%` }}
                    />
                  </div>
                  {/* Manual headcount controls for testing */}
                  <div className="flex items-center space-x-1.5 mt-2">
                    <button
                      onClick={() => handleAdjustOccupancy(-1)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleAdjustOccupancy(1)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      +1
                    </button>
                    <span className="text-[9px] text-slate-500 ml-1">Simulate flow</span>
                  </div>
                </div>

                {/* 2. Lights */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Lightbulb className={`h-4 w-4 ${room?.lights_status === 'ON' ? 'text-yellow-400' : 'text-slate-600'}`} />
                      <span>Lights</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${room?.lights_status === 'ON' ? 'bg-yellow-950 text-yellow-300' : 'bg-slate-800 text-slate-400'}`}>
                      {room?.lights_status}
                    </span>
                  </div>
                  <div className="text-xl font-black text-white">
                    {room?.lights_status === 'ON' ? 'Active' : 'Off (Eco)'}
                  </div>
                  <button
                    disabled={controlling}
                    onClick={() => handleToggleDevice('lights', room?.lights_status ?? 'ON')}
                    className="mt-2 w-full py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    Toggle Control
                  </button>
                </div>

                {/* 3. Temperature */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Thermometer className="h-4 w-4 text-rose-400" />
                      <span>Temperature</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">DHT22</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {room?.temperature}°C
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                    <span>AC: <strong>{room?.ac_status}</strong></span>
                    <button
                      disabled={controlling}
                      onClick={() => handleToggleDevice('ac', room?.ac_status ?? 'ON')}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Override
                    </button>
                  </div>
                </div>

                {/* 4. Computers Online */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Monitor className="h-4 w-4 text-emerald-400" />
                      <span>Computers</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">PoE SNMP</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {computersOnline} <span className="text-sm font-normal text-slate-500">/ {computersTotal}</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-1">
                    {Math.round((computersOnline / Math.max(1, computersTotal)) * 100)}% online workstations
                  </p>
                </div>

                {/* 5. Next Class */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span>Next Class</span>
                    </span>
                    <span className="text-[10px] font-mono text-purple-300">Schedule</span>
                  </div>
                  <div className="text-xl font-black text-white">
                    {data?.schedules && data.schedules.length > 0 ? (
                      data.schedules[0].start_time.substring(0, 5)
                    ) : (
                      'None'
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-1">
                    {data?.schedules && data.schedules.length > 0
                      ? data.schedules[0].title
                      : 'No upcoming lectures'}
                  </p>
                </div>
              </div>

              {/* SECONDARY ROW: Interactive Workstation Grid + Real-time Power & IoT Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Interactive Computer Workstation Visual Grid (7 cols) */}
                <div className="lg:col-span-7 bg-slate-950/60 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Workstation Cluster Layout ({computersOnline}/{computersTotal} Active)
                      </h4>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px]">
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <span className="h-2 w-2 rounded-xs bg-emerald-400"></span>
                        <span>Online</span>
                      </span>
                      <span className="flex items-center space-x-1 text-slate-500">
                        <span className="h-2 w-2 rounded-xs bg-slate-700"></span>
                        <span>Offline</span>
                      </span>
                    </div>
                  </div>

                  {/* 40 Interactive Workstations Matrix (4 rows of 10) */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                    {workstations.map((ws) => (
                      <div
                        key={ws.id}
                        title={`PC-WS-${ws.id < 10 ? '0' + ws.id : ws.id} (${ws.ip}) - ${ws.isOnline ? 'Online' : 'Offline'}`}
                        className={`group relative p-2 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                          ws.isOnline
                            ? 'bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50'
                            : 'bg-slate-800/40 border border-slate-700/30 opacity-60'
                        }`}
                      >
                        <Monitor className={`h-4 w-4 ${ws.isOnline ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[9px] font-mono mt-1 text-slate-300">
                          #{ws.id}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Power Load: <strong>{room?.power_watts} W</strong></span>
                    <span>Air Quality: <strong>{room?.air_quality_aqi} AQI (Good)</strong></span>
                    <span>Noise: <strong>{room?.noise_db} dB</strong></span>
                    <span>Network: <strong className="text-emerald-400">{room?.network_status}</strong></span>
                  </div>
                </div>

                {/* Right: Edge Hardware, QR Verification, & Schedules (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Active Booking & Instant QR Token */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <QrCode className="h-4 w-4 text-cyan-400" />
                        <span>Room Access & Verified QR Token</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        {room?.qr_code_token ?? 'QR-GEN'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      {/* SVG QR Visual */}
                      <div className="h-16 w-16 bg-white p-1 rounded flex items-center justify-center">
                        <QrCode className="h-14 w-14 text-slate-950" />
                      </div>
                      <div className="text-xs space-y-1 text-slate-300">
                        <p className="font-semibold text-white">Scan at physical room door tablet</p>
                        <p className="text-[11px] text-slate-400">Instantly marks attendance & logs check-in in MySQL.</p>
                      </div>
                    </div>
                  </div>

                  {/* Registered IoT Devices in this Room */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center space-x-1.5">
                      <HardDrive className="h-4 w-4 text-cyan-400" />
                      <span>Physical Hardware Inventory</span>
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {data?.equipment && data.equipment.length > 0 ? (
                        data.equipment.map((eq) => (
                          <div key={eq.id} className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-900/60 border border-slate-800/80">
                            <div>
                              <div className="font-semibold text-white">{eq.device_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{eq.ip_address} &bull; {eq.type}</div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                              {eq.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No specific hardware devices registered.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Edge Pipeline: ESP32 $\rightarrow$ MQTT $\rightarrow$ Flask Backend $\rightarrow$ Digital Twin</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
