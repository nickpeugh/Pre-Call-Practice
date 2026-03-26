import React, { useMemo, useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  Users, 
  Activity, 
  TrendingUp, 
  Search, 
  ChevronRight, 
  BarChart3,
  ArrowLeft,
  Filter,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  sessions: any[];
  onBack: () => void;
  logoUrl?: string;
}

export function Dashboard({ sessions, onBack, logoUrl }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false once we have data or if it's been a while
  React.useEffect(() => {
    if (sessions.length > 0) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [sessions]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const avgRating = total > 0 
      ? Math.round(sessions.reduce((acc, s) => acc + s.rating, 0) / total)
      : 0;
    
    const uniqueAdvocates = new Set(sessions.map(s => s.empId)).size;
    const perfectScores = sessions.filter(s => s.rating === 100).length;

    // Location breakdown
    const locations: Record<string, { count: number, avg: number, sum: number }> = {};
    sessions.forEach(s => {
      if (!locations[s.location]) {
        locations[s.location] = { count: 0, avg: 0, sum: 0 };
      }
      locations[s.location].count++;
      locations[s.location].sum += s.rating;
      locations[s.location].avg = Math.round(locations[s.location].sum / locations[s.location].count);
    });

    const locationList = Object.entries(locations)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      avgRating,
      uniqueAdvocates,
      perfectScores,
      locationList
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = s.empId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.scenarioName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = locationFilter === 'All' || s.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [sessions, searchTerm, locationFilter]);

  const locations = useMemo(() => {
    const locs = Array.from(new Set(sessions.map(s => s.location)));
    return ['All', ...locs.sort()];
  }, [sessions]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800 hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            {logoUrl && (
              <div className="h-[72px] w-auto">
                <img 
                  src={logoUrl} 
                  alt="Road Trip" 
                  className="h-full w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black tracking-tight">Manager Dashboard</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pre-Call Training performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">
              M
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Pre-Call Data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                icon={<Activity className="w-5 h-5" />} 
                label="Total Sessions" 
                value={stats.total} 
                color="text-blue-500"
                bg="bg-blue-500/10"
              />
              <StatCard 
                icon={<Award className="w-5 h-5" />} 
                label="Avg. Pre-Call Rating" 
                value={`${stats.avgRating}%`} 
                color="text-yellow-500"
                bg="bg-yellow-500/10"
              />
              <StatCard 
                icon={<Users className="w-5 h-5" />} 
                label="Active Advocates" 
                value={stats.uniqueAdvocates} 
                color="text-purple-500"
                bg="bg-purple-500/10"
              />
              <StatCard 
                icon={<CheckCircle className="w-5 h-5" />} 
                label="Mastery Rate" 
                value={`${stats.total > 0 ? Math.round((stats.perfectScores / stats.total) * 100) : 0}%`} 
                color="text-green-500"
                bg="bg-green-500/10"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content: Session List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-black uppercase tracking-widest text-gray-500">Recent Activity</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search Emp ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select 
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="appearance-none bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-8 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredSessions.map((s, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={s.id} 
                      className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-900 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center font-black text-xs text-gray-400 border border-gray-700">
                          {s.empId.slice(-4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{s.empId}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full">{s.location.split(' - ')[0]}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{s.scenarioName} • {new Date(s.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`text-lg font-black ${s.rating === 100 ? 'text-green-500' : s.rating >= 80 ? 'text-blue-500' : 'text-yellow-500'}`}>
                            {s.rating}%
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Rating</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                  {filteredSessions.length === 0 && (
                    <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-gray-800 border-dashed">
                      <BarChart3 className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                      <p className="text-gray-500">No sessions found matching your filters.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar: Location Performance */}
              <div className="space-y-6">
                <h2 className="text-lg font-black uppercase tracking-widest text-gray-500">Location Performance</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
                  {stats.locationList.slice(0, 8).map((loc, i) => (
                    <div key={loc.name} className={`p-4 flex items-center justify-between ${i !== stats.locationList.length - 1 ? 'border-b border-gray-800' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-500">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate w-32 md:w-40">{loc.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">{loc.count} Sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-500">{loc.avg}%</span>
                        <div className="w-16 bg-gray-800 h-1 rounded-full mt-1 overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${loc.avg}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 space-y-4 shadow-xl shadow-blue-900/20">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight">Pre-Call Mastery</h3>
                    <p className="text-blue-100 text-xs mt-1">Overall training completion is up 12% this week across all locations.</p>
                  </div>
                  <button className="w-full bg-white text-blue-600 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl shadow-lg">
                    View Full Report
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
        <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}
