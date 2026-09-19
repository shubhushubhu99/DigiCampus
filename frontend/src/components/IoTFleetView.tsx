import React, { useState, useEffect } from 'react';
import { Equipment, IoTLog, Room } from '../types/campus';
import { api } from '../services/api';
import { 
  Radio, 
  Cpu, 
  Terminal, 
  Activity, 
  Wifi, 
  HardDrive, 
  Server, 
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface IoTFleetViewProps {
  rooms: Room[];
}

export const IoTFleetView: React.FC<IoTFleetViewProps> = ({ rooms }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [logs, setLogs] = useState<IoTLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual simulator controls
  const [simRoomId, setSimRoomId] = useState<number>(rooms[0]?.id ?? 1);
  const [simTemp, setSimTemp] = useState<number>(24.0);
  const [simOcc, setSimOcc] = useState<number>(31);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [eqData, logsData] = await Promise.all([
        api.getEquipment(),
        api.getIoTLogs()
      ]);
      setEquipment(eqData);
      setLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePushSensorUpdate = async (type: 'temp' | 'occupancy', val: number) => {
    try {
      await api.toggleDeviceControl(simRoomId, type, val);
      setSimFeedback(`Pushed sensor update: ${type} = ${val}`);
      await fetchData();
      setTimeout(() => setSimFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* IoT Pipeline Schematic Banner (from Idea 2.docx) */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
          <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span>Physical-to-Virtual Pipeline Architecture</span>
        </div>
        <h2 className="text-base font-bold text-white mb-2">
          Real-Time Sensor &bull; ESP32 &bull; MQTT &bull; Flask &bull; Digital Twin
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          Edge gateways (ESP32 microcontrollers) ingest DHT22 ambient sensors, PIR motion arrays, and PZEM energy meters, broadcasting to the local MQTT broker and updating the MySQL twin state in real-time.
        </p>

        {/* Visual Pipeline Flowchart */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <Activity className="h-5 w-5 text-rose-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-white">1. Physical Sensors</div>
            <div className="text-[10px] text-slate-400 mt-0.5">DHT22 / PIR / PZEM</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <Cpu className="h-5 w-5 text-amber-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-white">2. ESP32 Node</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Edge Microcontroller</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <Radio className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-white">3. MQTT Broker</div>
            <div className="text-[10px] text-slate-400 mt-0.5">campus/telemetry/#</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <Server className="h-5 w-5 text-purple-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-white">4. Flask Backend</div>
            <div className="text-[10px] text-slate-400 mt-0.5">MySQL Telemetry Sync</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-gradient-to-tr from-cyan-950/80 to-blue-950/80 border border-cyan-500/40">
            <Terminal className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-emerald-300">5. Digital Twin UI</div>
            <div className="text-[10px] text-cyan-200 mt-0.5">Live 3D &amp; Telemetry</div>
          </div>
        </div>
      </div>

      {/* Grid: Live Packet Stream Terminal + Manual Edge Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Terminal Log Stream of MQTT Packets (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live MQTT Broker Ingestion Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                LISTENING
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[11px] h-96 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-20">Awaiting edge telemetry frames...</div>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="p-2 rounded bg-slate-900/60 border border-slate-800/60 text-slate-300 hover:bg-slate-900 transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="text-cyan-400 font-semibold">{l.topic}</span>
                      <span>{l.received_at}</span>
                    </div>
                    <div className="text-emerald-400 text-[10px]">
                      Device: <strong>{l.device_uid}</strong>
                    </div>
                    <div className="text-[10px] text-slate-300 break-all bg-slate-950/80 p-1.5 rounded mt-1">
                      {JSON.stringify(l.payload)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated sensor stream broadcasts every 3 seconds</span>
            <span className="text-cyan-400">MySQL Table: iot_message_logs</span>
          </div>
        </div>

        {/* Right: Edge Sensor Simulation Injector (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Edge Telemetry Injector</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Simulate Hardware Inputs</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inject mock telemetry into any room to test the digital twin’s responsiveness and triggering logic.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Room</label>
                <select
                  value={simRoomId}
                  onChange={(e) => setSimRoomId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature Slider */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Temperature: <strong>{simTemp}°C</strong></span>
                  <button
                    onClick={() => handlePushSensorUpdate('temp', simTemp)}
                    className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 hover:bg-cyan-500/30"
                  >
                    Inject Temp
                  </button>
                </div>
                <input
                  type="range"
                  min="16"
                  max="38"
                  step="0.5"
                  value={simTemp}
                  onChange={(e) => setSimTemp(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Occupancy Slider */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span>Headcount Occupancy: <strong>{simOcc} persons</strong></span>
                  <button
                    onClick={() => handlePushSensorUpdate('occupancy', simOcc)}
                    className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 hover:bg-cyan-500/30"
                  >
                    Inject Occupancy
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={simOcc}
                  onChange={(e) => setSimOcc(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {simFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{simFeedback}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Hardware Fleet summary */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Hardware Fleet Devices ({equipment.length})</span>
              <span className="text-emerald-400 font-semibold">{equipment.filter(e => e.status === 'ONLINE').length} Online</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-slate-900/60 text-[10px] text-slate-300 border border-slate-800">
                ESP32 Nodes: <strong>{equipment.filter(e => e.type === 'sensor_esp32').length}</strong>
              </div>
              <div className="p-2 rounded bg-slate-900/60 text-[10px] text-slate-300 border border-slate-800">
                Core Routers: <strong>{equipment.filter(e => e.type === 'router').length}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
