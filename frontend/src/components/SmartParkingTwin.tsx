import React, { useState, useEffect } from 'react';
import { ParkingOverview, ParkingSlot } from '../types/campus';
import { api } from '../services/api';
import { 
  Car, 
  BatteryCharging, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Layers,
  ArrowDownUp
} from 'lucide-react';

export const SmartParkingTwin: React.FC = () => {
  const [data, setData] = useState<ParkingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchParking = async () => {
    try {
      const res = await api.getParking();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParking();
  }, []);

  const handleToggleSlot = async (slotId: number) => {
    setTogglingId(slotId);
    try {
      await api.toggleParkingSlot(slotId);
      await fetchParking();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="text-center py-20 text-slate-400 text-xs animate-pulse">
        Polling smart parking ultrasound sensors &amp; ANPR cameras...
      </div>
    );
  }

  const stats = data?.stats;
  const zones = data?.zones ?? [];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Campus Bays</span>
            <Car className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.total_slots}</div>
          <p className="text-[10px] text-slate-500 mt-1">Monitored by ultrasonic edge nodes</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Available Slots</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats?.available_count}</div>
          <p className="text-[10px] text-emerald-500/80 mt-1">Ready for incoming vehicles</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Occupied</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats?.occupied_count}</div>
          <p className="text-[10px] text-slate-400 mt-1">{stats?.utilization_pct}% capacity filled</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>EV Fast Chargers</span>
            <BatteryCharging className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{stats?.ev_occupied} / {stats?.ev_total}</div>
          <p className="text-[10px] text-blue-400/80 mt-1">Level 2 (22kW) charging active</p>
        </div>
      </div>

      {/* Interactive Parking Zones Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400">{zone.code}</span>
                  <h3 className="text-base font-bold text-white">{zone.name}</h3>
                </div>
                <div className="text-xs text-slate-400">
                  <span>{zone.slots.filter(s => !s.is_occupied).length} free</span> / {zone.slots.length} total
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {zone.slots.map((slot) => {
                  const isEV = slot.type === 'EV_CHARGING';
                  const isOccupied = slot.is_occupied;
                  const isHandicap = slot.type === 'HANDICAP';

                  let borderClass = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
                  if (isOccupied) {
                    borderClass = isEV 
                      ? 'border-blue-500/50 bg-blue-950/30 text-blue-300' 
                      : 'border-rose-500/50 bg-rose-950/30 text-rose-300';
                  }

                  return (
                    <button
                      key={slot.id}
                      disabled={togglingId === slot.id}
                      onClick={() => handleToggleSlot(slot.id)}
                      className={`group relative p-3 rounded-xl border flex flex-col justify-between text-left transition-all hover:scale-105 ${borderClass}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-black">{slot.slot_number}</span>
                        {isEV ? (
                          <BatteryCharging className={`h-4 w-4 ${isOccupied ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                        ) : (
                          <Car className={`h-4 w-4 ${isOccupied ? 'text-rose-400' : 'text-slate-600'}`} />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold">
                          {isOccupied ? (isEV ? 'CHARGING' : 'OCCUPIED') : 'VACANT'}
                        </div>
                        <div className="text-[9px] font-mono truncate text-slate-400">
                          {isOccupied ? (slot.vehicle_plate || 'PARKED') : slot.type}
                        </div>
                      </div>

                      {/* Click prompt overlay */}
                      <div className="mt-2 pt-1 border-t border-white/5 text-[9px] text-slate-500 group-hover:text-cyan-300 transition-colors">
                        Click to {isOccupied ? 'Exit' : 'Park'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Smart ANPR camera live feed attached</span>
              <span className="text-cyan-400">Click any spot to simulate car arrival/departure</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
