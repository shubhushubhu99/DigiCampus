import React, { useState } from 'react';
import { 
  Building, 
  Room, 
  Floor 
} from '../types/campus';
import { 
  Building2, 
  Users, 
  Zap, 
  Thermometer, 
  Layers, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  Lightbulb,
  Search
} from 'lucide-react';

interface CampusMapProps {
  buildings: Building[];
  onSelectRoom: (roomId: number) => void;
  selectedBuildingId: number | null;
  setSelectedBuildingId: (id: number | null) => void;
  allRooms: Room[];
}

export const CampusMap: React.FC<CampusMapProps> = ({
  buildings,
  onSelectRoom,
  selectedBuildingId,
  setSelectedBuildingId,
  allRooms
}) => {
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number>(2); // Default 2nd floor (where LAB-204 is!)
  const [searchQuery, setSearchQuery] = useState('');

  const activeBuilding = buildings.find(b => b.id === (selectedBuildingId || 1));
  const buildingRooms = allRooms.filter(r => r.building_id === activeBuilding?.id);
  const floorRooms = buildingRooms.filter(r => (r.floor_number ?? 1) === selectedFloorNumber);

  // Filtered rooms for quick search
  const searchedRooms = searchQuery.trim() === '' 
    ? [] 
    : allRooms.filter(r => 
        r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.building_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="space-y-6">
      {/* Search & Top Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center glass-panel p-4 rounded-2xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search room (e.g. LAB-204, LAB-301, Auditorium)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          {searchedRooms.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-2 space-y-1">
              {searchedRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSearchQuery('');
                    onSelectRoom(room.id);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold text-cyan-400 text-xs">{room.room_number}</span>
                    <span className="text-slate-300 text-xs ml-2">{room.name}</span>
                    <p className="text-[10px] text-slate-500">{room.building_name} &bull; Floor {room.floor_number}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>{room.current_occupancy}/{room.capacity}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
            <span>Available</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
            <span>Moderate (50%+)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500"></span>
            <span>Near Capacity (80%+)</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Grid: Campus Schematic + Floor Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campus 2.5D Overview Map (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <span>Interactive Campus Spatial Twin</span>
              </h2>
              <p className="text-xs text-slate-400">Select a building zone to inspect floor plans and room telemetry</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-full flex items-center space-x-1">
              <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
              <span>SPATIAL ENGINE ACTIVE</span>
            </span>
          </div>

          {/* SVG Campus Map Canvas */}
          <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-800/90 overflow-hidden shadow-inner flex items-center justify-center p-4">
            <svg viewBox="0 0 650 420" className="w-full h-full select-none">
              {/* Ground Grid Pattern */}
              <defs>
                <pattern id="campus-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                {/* Building Drop Shadow */}
                <filter id="building-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(6,182,212,0.25)" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#campus-grid)" />

              {/* Central Courtyard & Walkways */}
              <path d="M 120 200 L 530 200 M 325 70 L 325 350" stroke="rgba(148,163,184,0.12)" strokeWidth="20" strokeLinecap="round" />
              <circle cx="325" cy="200" r="35" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="325" cy="200" r="12" fill="rgba(6,182,212,0.2)" />
              <text x="325" y="204" fill="#94A3B8" fontSize="9" textAnchor="middle" fontWeight="bold">PLAZA</text>

              {/* Campus Greenery Zones */}
              <rect x="60" y="50" width="60" height="60" rx="8" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
              <text x="90" y="85" fill="#10B981" fontSize="9" textAnchor="middle">Garden A</text>

              <rect x="520" y="270" width="70" height="70" rx="8" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
              <text x="555" y="310" fill="#10B981" fontSize="9" textAnchor="middle">Eco Zone</text>

              {/* Interactive Building Blocks */}
              {buildings.map((bld) => {
                const isSelected = bld.id === (selectedBuildingId || 1);
                // Building footprint positions
                let x = 140, y = 80, w = 150, h = 90;
                if (bld.code === 'BLD-TECH') { x = 140; y = 70; w = 150; h = 95; }
                else if (bld.code === 'BLD-ACAD') { x = 360; y = 70; w = 150; h = 95; }
                else if (bld.code === 'BLD-LIB') { x = 140; y = 240; w = 150; h = 95; }
                else if (bld.code === 'BLD-AUD') { x = 360; y = 240; w = 150; h = 95; }

                return (
                  <g 
                    key={bld.id} 
                    onClick={() => {
                      setSelectedBuildingId(bld.id);
                      // default to floor 2 for Tech building, floor 1 otherwise
                      setSelectedFloorNumber(bld.id === 1 ? 2 : 1);
                    }}
                    className="cursor-pointer transition-all duration-300 group"
                  >
                    {/* Shadow / Base */}
                    <rect 
                      x={x + 5} 
                      y={y + 8} 
                      width={w} 
                      height={h} 
                      rx="12" 
                      fill="rgba(0,0,0,0.5)" 
                    />
                    {/* Building Main Prism Body */}
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx="12"
                      fill={isSelected ? '#0F172A' : '#1E293B'}
                      stroke={isSelected ? '#06B6D4' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isSelected ? '2.5' : '1'}
                      filter={isSelected ? 'url(#building-glow)' : undefined}
                    />

                    {/* Floor Lines Accent */}
                    <line x1={x + 10} y1={y + 32} x2={x + w - 10} y2={y + 32} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <line x1={x + 10} y1={y + 58} x2={x + w - 10} y2={y + 58} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                    {/* Building Code Tag */}
                    <rect x={x + 10} y={y + 10} width="65" height="15" rx="4" fill="rgba(6,182,212,0.15)" />
                    <text x={x + 14} y={y + 21} fill="#22D3EE" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                      {bld.code}
                    </text>

                    {/* Building Name */}
                    <text x={x + 10} y={y + 46} fill="#F8FAFC" fontSize="11" fontWeight="bold">
                      {bld.name.length > 20 ? bld.name.substring(0, 18) + '...' : bld.name}
                    </text>

                    {/* Live Occupancy Metric */}
                    <text x={x + 10} y={y + 75} fill="#94A3B8" fontSize="9.5">
                      👥 {bld.current_occupancy} / {bld.capacity} &bull; ⚡ {bld.power_watts}W
                    </text>

                    {/* Active pulse on selected */}
                    {isSelected && (
                      <circle cx={x + w - 15} cy={y + 18} r="5" fill="#06B6D4">
                        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Parking Lots Overview */}
              <g className="cursor-pointer">
                <rect x="50" y="360" width="240" height="40" rx="8" fill="#1E293B" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <text x="65" y="385" fill="#94A3B8" fontSize="10" fontWeight="bold">🅿️ North Lot (Faculty & EV)</text>
              </g>

              <g className="cursor-pointer">
                <rect x="360" y="360" width="240" height="40" rx="8" fill="#1E293B" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <text x="375" y="385" fill="#94A3B8" fontSize="10" fontWeight="bold">🅿️ South Lot (EV Hub & Students)</text>
              </g>
            </svg>
          </div>

          {/* Quick Building Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBuildingId(b.id);
                  setSelectedFloorNumber(b.id === 1 ? 2 : 1);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  (selectedBuildingId || 1) === b.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs truncate text-white">{b.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{b.total_floors} Floors &bull; {b.current_occupancy} occupants</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Floor Plan & Room Telemetry Navigator (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">{activeBuilding?.code}</span>
                <h3 className="text-lg font-bold text-white">{activeBuilding?.name}</h3>
                <p className="text-xs text-slate-400">{activeBuilding?.description}</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                {[1, 2, 3].slice(0, activeBuilding?.total_floors || 3).map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setSelectedFloorNumber(fl)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedFloorNumber === fl
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Floor {fl}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Rooms Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Rooms on Floor {selectedFloorNumber}</span>
                <span>{floorRooms.length} Spaces Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {floorRooms.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                    No registered rooms on this floor level.
                  </div>
                ) : (
                  floorRooms.map((room) => {
                    const occPct = room.capacity > 0 ? (room.current_occupancy ?? 0) / room.capacity : 0;
                    const isLab204 = room.room_number === 'LAB-204';
                    const isLab301 = room.room_number === 'LAB-301';

                    let statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
                    if (occPct >= 0.8) statusColor = 'text-rose-400 border-rose-500/30 bg-rose-950/20';
                    else if (occPct >= 0.5) statusColor = 'text-amber-400 border-amber-500/30 bg-amber-950/20';

                    return (
                      <div
                        key={room.id}
                        onClick={() => onSelectRoom(room.id)}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                          isLab204
                            ? 'border-cyan-500/60 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900/90 shadow-lg shadow-cyan-950/50'
                            : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Header: Room Number & Type */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-extrabold text-cyan-400">{room.room_number}</span>
                            {isLab204 && (
                              <span className="text-[9px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                                DOC FOCUS
                              </span>
                            )}
                            {isLab301 && (
                              <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/40">
                                AI TARGET
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusColor}`}>
                            {room.current_occupancy ?? 0} / {room.capacity}
                          </span>
                        </div>

                        {/* Room Name */}
                        <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
                          {room.name}
                        </h4>

                        {/* Real-time Telemetry Snapshot Pills */}
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center space-x-1">
                            <Thermometer className="h-3 w-3 text-amber-400" />
                            <span>{room.temperature ?? 24}°C</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="h-3 w-3 text-cyan-400" />
                            <span>{room.power_watts ?? 400}W</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Lightbulb className={`h-3 w-3 ${room.lights_status === 'ON' ? 'text-yellow-400' : 'text-slate-600'}`} />
                            <span>Lights: {room.lights_status ?? 'ON'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-emerald-400" />
                            <span>PCs: {room.computers_online ?? 0}/{room.computers_total ?? 0}</span>
                          </div>
                        </div>

                        {/* Hover Prompt */}
                        <div className="mt-3 flex items-center justify-between text-[10px] text-cyan-400 font-semibold group-hover:underline">
                          <span>Inspect Live Twin</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Tip: Click on <strong className="text-cyan-300">LAB-204</strong> to view the live IoT telemetry twin.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
