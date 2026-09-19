import React, { useState, useEffect } from 'react';
import { AIRecommendation } from '../types/campus';
import { api } from '../services/api';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  TrendingDown, 
  RefreshCw, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

export const AIOptimizerView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRecs = async () => {
    try {
      const data = await api.getAIRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setFeedback(null);
    try {
      const res = await api.evaluateAIOptimizations();
      setRecommendations(res.recommendations);
      setFeedback('AI Heuristic Engine completed campus-wide occupancy & energy scan.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleApply = async (id: number) => {
    setApplyingId(id);
    try {
      const res = await api.applyAIRecommendation(id);
      setFeedback(res.message);
      await fetchRecs();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to execute recommendation');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-cyan-500/30">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Campus AI Optimization Engine</h2>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800">
                ACTIVE HEURISTICS
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Autonomous machine intelligence continuously scans live occupancy, thermal dissipation, HVAC loads, and class timetables to balance campus resources and eliminate carbon waste.
            </p>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating Sensors...' : 'Run AI Evaluation Scan'}</span>
          </button>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Active Intelligence Proposals ({recommendations.filter(r => !r.is_applied).length} pending)</span>
          <span>Automatic dispatch supported</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading recommendations from database...</div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">No pending optimizations found. All systems operating at peak efficiency!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => {
              const isApplied = rec.is_applied;
              const isHigh = rec.priority === 'HIGH';

              return (
                <div
                  key={rec.id}
                  className={`glass-panel rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                    isApplied 
                      ? 'border-slate-800 bg-slate-950/40 opacity-70' 
                      : isHigh 
                      ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900 shadow-xl shadow-cyan-950/30' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Badge row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          rec.category === 'REALLOCATION'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : rec.category === 'ENERGY_SAVER'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}>
                          {rec.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHigh ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {rec.priority} PRIORITY
                        </span>
                      </div>

                      {isApplied && (
                        <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Applied to System</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white mb-2">{rec.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{rec.description}</p>

                    {/* Affected entities visual */}
                    {(rec.impacted_room_number || rec.suggested_room_number) && (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 mb-4 flex items-center justify-between text-xs">
                        {rec.impacted_room_number && (
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Current Load</span>
                            <span className="font-mono font-bold text-rose-400">{rec.impacted_room_number}</span>
                          </div>
                        )}
                        {rec.suggested_room_number && (
                          <>
                            <ArrowRight className="h-4 w-4 text-cyan-400 mx-2" />
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 uppercase font-mono block">AI Target</span>
                              <span className="font-mono font-bold text-emerald-400">{rec.suggested_room_number}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate mr-2">
                      {rec.suggested_action || 'Execute action'}
                    </span>
                    {!isApplied ? (
                      <button
                        onClick={() => handleApply(rec.id)}
                        disabled={applyingId === rec.id}
                        className="whitespace-nowrap px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center space-x-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{applyingId === rec.id ? 'Applying...' : 'Execute Now'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                      >
                        Executed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
