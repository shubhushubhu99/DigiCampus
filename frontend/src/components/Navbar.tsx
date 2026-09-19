import React from 'react';
import { 
  Building2, 
  Cpu, 
  Calendar, 
  Car, 
  Sparkles, 
  Radio, 
  Activity, 
  Zap, 
  Users 
} from 'lucide-react';
import { CampusMetrics } from '../types/campus';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics: CampusMetrics | null;
  isStreamActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  isStreamActive
}) => {
  const tabs = [
    { id: 'map', label: 'Campus Twin & Map', icon: Building2 },
    { id: 'labs', label: 'Smart Labs & Rooms', icon: Cpu },
    { id: 'bookings', label: 'Bookings & QR Check-In', icon: Calendar },
    { id: 'parking', label: 'Smart Parking', icon: Car },
    { id: 'ai', label: 'AI Optimizer', icon: Sparkles, badge: 'AI' },
    { id: 'iot', label: 'IoT Stream & Fleet', icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20">
            <Activity className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isStreamActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isStreamActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider text-white">DIGI<span className="text-cyan-400">CAMPUS</span></span>
              <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-cyan-400 border border-cyan-800/60">TWIN v2.4</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Apex Institute of Technology &bull; Virtual Replica Engine</p>
          </div>
        </div>

        {/* Live Metrics Quick Bar */}
        {metrics && (
          <div className="hidden lg:flex items-center space-x-4 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Occupants: <strong className="text-white">{metrics.total_occupants}</strong> / {metrics.total_capacity}</span>
              <span className="text-slate-500">({metrics.occupancy_rate}%)</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Grid Load: <strong className="text-white">{metrics.total_power_kw} kW</strong></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Online PCs: <strong className="text-white">{metrics.total_online_pcs}</strong> / {metrics.total_pcs}</span>
            </div>
          </div>
        )}

        {/* Live Connection indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${isStreamActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[11px] text-slate-400 font-medium">
              {isStreamActive ? 'MQTT Stream Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto flex max-w-7xl space-x-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center space-x-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[9px] font-bold text-cyan-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
