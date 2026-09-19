import React from 'react';
import { Room } from '../types/campus';
import { 
  Cpu, 
  Users, 
  Thermometer, 
  Zap, 
  Lightbulb, 
  Monitor, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface SmartLabMonitorProps {
  rooms: Room[];
  onSelectRoom: (roomId: number) => void;
  onNavigateToAI: () => void;
}

export const SmartLabMonitor: React.FC<SmartLabMonitorProps> = ({
  rooms,
  onSelectRoom,
  onNavigateToAI
}) => {
  const labRooms = rooms.filter(r => 
    r.type.includes('lab') || r.room_number.startsWith('LAB')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner highlighting doc's Lab 204 vs Lab 301 concept */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Digital Twin AI Optimization Active
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Smart Lab Balancing &amp; Energy Intelligence
            </h3>
            <p className="text-xs text-slate-300">
              The Digital Twin system monitors real-time headcounts, HVAC loads, and workstation utilization to dynamically recommend lab reallocations (e.g., from <strong className="text-cyan-300">LAB-204</strong> to <strong className="text-purple-300">LAB-301</strong>).
            </p>
          </div>

          <button
            onClick={onNavigateToAI}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>View AI Reallocation Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labRooms.map((lab) => {
          const occPct = lab.capacity > 0 ? (lab.current_occupancy ?? 0) / lab.capacity : 0;
          const isLab204 = lab.room_number === 'LAB-204';
          const isLab301 = lab.room_number === 'LAB-301';

          return (
            <div
              key={lab.id}
              onClick={() => onSelectRoom(lab.id)}
              className={`glass-panel rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:scale-[1.01] flex flex-col justify-between border ${
                isLab204 
                  ? 'border-cyan-500/60 bg-gradient-to-br from-cyan-950/30 to-slate-900/90 shadow-lg shadow-cyan-950/40' 
                  : isLab301 
                  ? 'border-purple-500/50 bg-gradient-to-br from-purple-950/30 to-slate-900/90' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-extrabold text-cyan-400">{lab.room_number}</span>
                      {isLab204 && (
                        <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/40">
                          DOCUMENT SPEC
                        </span>
                      )}
                      {isLab301 && (
                        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                          TARGET LAB
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{lab.name}</h4>
                    <p className="text-[11px] text-slate-400">{lab.building_name} &bull; Floor {lab.floor_number}</p>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    occPct > 0.75 
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                      : occPct > 0.3 
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {lab.current_occupancy ?? 0} / {lab.capacity}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occPct > 0.75 ? 'bg-rose-500' : occPct > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(occPct * 100))}%` }}
                  />
                </div>

                {/* Telemetry Dials */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2.5">
                    <Thermometer className="h-4 w-4 text-rose-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Temperature</div>
                      <div className="text-xs font-bold text-white">{lab.temperature ?? 24}°C</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Power Draw</div>
                      <div className="text-xs font-bold text-white">{lab.power_watts ?? 450} W</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2.5">
                    <Monitor className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Online PCs</div>
                      <div className="text-xs font-bold text-white">{lab.computers_online ?? 0} / {lab.computers_total ?? 0}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2.5">
                    <Lightbulb className={`h-4 w-4 ${lab.lights_status === 'ON' ? 'text-yellow-400' : 'text-slate-600'}`} />
                    <div>
                      <div className="text-[10px] text-slate-400">Lighting</div>
                      <div className="text-xs font-bold text-white">{lab.lights_status ?? 'ON'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400">
                <span>Inspect Digital Twin</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
