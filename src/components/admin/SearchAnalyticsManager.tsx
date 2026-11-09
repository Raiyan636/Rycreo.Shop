import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Search, 
  Globe, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  MapPin, 
  Wifi, 
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '../common/Toast';

export const SearchAnalyticsManager: React.FC = () => {
  const { searchLogs, searchTelemetry, refreshTelemetry, clearSearchLogs } = useStore();
  const { showToast } = useToast();
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'live_feed' | 'keyword_ranks'>('live_feed');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for genuine live telemetry logs
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTelemetry();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshTelemetry();
    setTimeout(() => setIsRefreshing(false), 500);
    showToast("Live telemetry feed synced with server!", "success");
  };

  const handleClear = () => {
    clearSearchLogs();
    showToast("All search telemetry and keyword logs cleared successfully!", "success");
  };

  const filteredTelemetry = searchTelemetry.filter(log => 
    log.query.toLowerCase().includes(filterQuery.toLowerCase()) ||
    log.ip.includes(filterQuery) ||
    log.location.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredLogs = searchLogs.filter(log => 
    log.query.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Live Streaming Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-5 rounded-2xl border border-slate-700">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Live Search Telemetry & Analytics
            </h3>
            {/* Live Streaming Pulsing Indicator */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE TELEMETRY STREAMING</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed capturing what customers search for worldwide: queries, IP addresses, city locations, and results count.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#38BDF8] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>

          {(searchTelemetry.length > 0 || searchLogs.length > 0) && (
            <button
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Feed</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Live Search Events
          </p>
          <p className="text-2xl font-black text-white font-mono">{searchTelemetry.length}</p>
          <p className="text-[10px] text-slate-500">Global real-time telemetry</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
            Unique Keywords
          </p>
          <p className="text-2xl font-black text-[#38BDF8] font-mono">{searchLogs.length}</p>
          <p className="text-[10px] text-slate-500">Aggregated user queries</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
            Accumulated Hits
          </p>
          <p className="text-2xl font-black text-[#F59E0B] font-mono">
            {searchLogs.reduce((sum, item) => sum + item.count, 0)}
          </p>
          <p className="text-[10px] text-slate-500">Total search executions</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-1">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Hot Demand Query
          </p>
          <p className="text-lg font-black text-white capitalize truncate">
            {searchLogs[0]?.query || 'None'}
          </p>
          <p className="text-[10px] text-slate-500">
            {searchLogs[0] ? `${searchLogs[0].count} searches recorded` : 'Awaiting traffic'}
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700 self-start">
          <button
            onClick={() => setActiveTab('live_feed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'live_feed' 
                ? 'bg-[#38BDF8] text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time Live Feed ({searchTelemetry.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('keyword_ranks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'keyword_ranks' 
                ? 'bg-[#38BDF8] text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top Keywords Ranking ({searchLogs.length})</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter by query, IP, or city..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#38BDF8]"
          />
        </div>
      </div>

      {/* Tab 1: Genuine Real-Time Live Feed (Module 2) */}
      {activeTab === 'live_feed' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl animate-fade-in">
          <div className="p-3.5 bg-slate-900 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Incoming Search Telemetry Stream
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-updating every 4s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Search Query</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Approximate Location</th>
                  <th className="p-3.5 text-right">Catalog Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono">
                {filteredTelemetry.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                      No live telemetry logs recorded yet. Try searching on the storefront!
                    </td>
                  </tr>
                ) : (
                  filteredTelemetry.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-bold text-white font-sans">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500/30 text-sky-200">
                          <Search className="w-3 h-3 text-[#38BDF8]" />
                          <span>{item.query}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono">
                          {item.ip}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-sans text-xs">
                        <span className="inline-flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{item.location}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.resultsCount > 0 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.resultsCount} Products
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Aggregated Top Keywords Ranking */}
      {activeTab === 'keyword_ranks' && (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl animate-fade-in">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Keyword Query</th>
                <th className="p-4 text-center">Search Volume</th>
                <th className="p-4 text-right">Last Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                    No keywords recorded matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-[#38BDF8] font-mono">#{idx + 1}</td>
                    <td className="p-4 font-bold text-white capitalize flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.query}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 font-black text-[#F59E0B]">
                        {log.count} hits
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.lastSearched).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
