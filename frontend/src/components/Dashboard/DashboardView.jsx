import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { statesAndUTs } from '../../utils/indiaData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Flame, 
  Lightbulb, 
  Compass, 
  Leaf, 
  Trophy, 
  TrendingDown, 
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const CO2_TIPS = [
  "Indian power grid emits ~0.82 kg CO2 per unit. Switching to LED bulbs saves 120 kg CO2/year.",
  "composting kitchen waste avoids landfill methane emissions, saving 0.4 kg CO2 per kg.",
  "Metro transits save 90% carbon compared to driving single-occupancy petrol sedans.",
  "Covering pots while cooking saves up to 20% of LPG usage, saving ~5 kg CO2 monthly.",
  "PM Surya Ghar scheme provides massive subsidies for home solar rooftops in India.",
  "Rethink fashion: buying one less new cotton t-shirt saves ~7 kg of carbon emissions."
];

export default function DashboardView() {
  const { user, token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  const [stateInfo, setStateInfo] = useState(null);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CO2_TIPS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Fetch activities
  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/activities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  // Identify state-specific recommendations
  useEffect(() => {
    if (user && user.state) {
      const match = statesAndUTs.find(s => s.name.toLowerCase() === user.state.toLowerCase());
      if (match) {
        setStateInfo(match);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate totals and statistics
  const loggedCarbon = activities.reduce((acc, a) => acc + (a.co2Emission || 0), 0);
  
  // Estimate annualized footprint based on logged activities, or use user.carbonScore
  const annualFootprint = user?.carbonScore || loggedCarbon * 2.5 || 2400;

  // Category data formatting for Recharts Pie Chart
  const categories = {
    electricity: 0,
    transport: 0,
    lpg: 0,
    food: 0,
    shopping: 0,
    waste: 0
  };

  activities.forEach(a => {
    if (categories[a.category] !== undefined) {
      categories[a.category] += a.co2Emission;
    }
  });

  const pieData = Object.keys(categories).map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: Number(categories[cat].toFixed(1))
  })).filter(item => item.value > 0);

  // Default fallback if no activities are logged yet
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Transport', value: 800 },
    { name: 'Electricity', value: 650 },
    { name: 'LPG', value: 300 },
    { name: 'Food', value: 450 },
    { name: 'Shopping', value: 120 },
    { name: 'Waste', value: 80 }
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Monthly trend chart logic (grouping activities by month)
  const monthlyDataMap = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Prepopulate last 5 months to ensure chart looks beautiful
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    monthlyDataMap[mName] = 0;
  }

  activities.forEach(a => {
    const date = new Date(a.date);
    const mName = monthNames[date.getMonth()];
    if (monthlyDataMap[mName] !== undefined) {
      monthlyDataMap[mName] += a.co2Emission;
    }
  });

  const trendData = Object.keys(monthlyDataMap).map(month => ({
    month,
    CO2: Number(monthlyDataMap[month].toFixed(1))
  }));

  // Indian benchmark comparisons
  const indianAvg = 2500;
  const globalAvg = 4700;
  const difference = ((annualFootprint / indianAvg) * 100).toFixed(0);
  const isBetterThanAvg = annualFootprint < indianAvg;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Eco Dashboard</h1>
          <p className="text-slate-500 mt-1">Namaste {user?.name || 'Citizen'}, see your sustainability scores today.</p>
        </div>
        <Link 
          to="/tracker"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-sm"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Log Eco Activity
        </Link>
      </div>

      {/* Daily Rotating Tip Banner */}
      <div className="p-4 bg-emerald-50 border border-brand-200 rounded-2xl flex items-start gap-3 shadow-sm hover:shadow-md transition-all">
        <div className="p-2 bg-brand-500 rounded-xl text-white shadow-sm shrink-0">
          <Lightbulb className="w-5 h-5 fill-white/10" />
        </div>
        <div>
          <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">Daily Green Tip</span>
          <p className="text-sm text-slate-700 mt-0.5 font-medium leading-relaxed">{CO2_TIPS[tipIndex]}</p>
        </div>
      </div>

      {/* Core Carbon Footprint Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Footprint Indicator Card */}
        <div className="glass-panel p-6 rounded-2xl shadow-glass flex flex-col justify-between border-l-4 border-l-brand-500 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-5">
            <Leaf className="w-36 h-36 text-brand-900" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carbon Footprint</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-extrabold text-brand-600 tracking-tight">{annualFootprint.toLocaleString()}</span>
              <span className="text-sm font-semibold text-slate-500">kg CO₂e/year</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Your estimated footprint normalized for Indian standards. Let's aim to lower this.
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Status:</span>
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1 ${isBetterThanAvg ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isBetterThanAvg ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {isBetterThanAvg ? 'Below National Avg' : 'Above National Avg'}
            </span>
          </div>
        </div>

        {/* National Benchmark Card */}
        <div className="glass-panel p-6 rounded-2xl shadow-glass flex flex-col justify-between border-l-4 border-l-blue-500">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">National Comparisons</span>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Indian Average</span>
                <span className="text-sm font-bold text-slate-700">{indianAvg} kg / yr</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (annualFootprint / indianAvg) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Global Average</span>
                <span className="text-sm font-bold text-slate-700">{globalAvg} kg / yr</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (annualFootprint / globalAvg) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-2xs text-slate-400 mt-4 leading-normal">
            *Sources: Carbon Dioxide Information Analysis Center (CDIAC) and MoEFCC reports.
          </div>
        </div>

        {/* Points & Badges Reward Card */}
        <div className="glass-panel p-6 rounded-2xl shadow-glass flex flex-col justify-between border-l-4 border-l-amber-500">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rewards & Green Points</span>
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/10" />
            </div>
            
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-4xl font-extrabold text-amber-500 tracking-tight">{user?.greenPoints || 0}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Green Points</span>
            </div>

            <div className="mt-4">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Earned Badges</span>
              <div className="flex flex-wrap gap-1.5">
                {user?.badges && user.badges.length > 0 ? (
                  user.badges.map(b => (
                    <span key={b} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded text-3xs uppercase tracking-wider">
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-2xs font-medium text-slate-400 italic">No badges earned yet. Log actions to earn!</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Complete challenges to earn big bonus points.</span>
          </div>
        </div>

      </div>

      {/* Local State Recommendation and Action Alert */}
      {stateInfo && (
        <div className="p-5 bg-gradient-to-r from-teal-900 to-brand-950 text-white rounded-2xl shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-teal-800 text-teal-200 rounded-full border border-teal-700 text-2xs font-bold uppercase tracking-wider">
                State Initiative: {stateInfo.program}
              </span>
              <h3 className="text-lg font-bold">Sustainability Program for {stateInfo.name}</h3>
              <p className="text-sm text-teal-100 max-w-2xl leading-relaxed">
                {stateInfo.recommendation}
              </p>
            </div>
            <Link 
              to="/calculator"
              className="px-4.5 py-2 bg-white text-brand-900 hover:bg-brand-50 transition-colors font-bold text-xs rounded-xl shadow shrink-0 cursor-pointer text-center"
            >
              Recalculate Footprint
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Data Charts (Recharts Area + Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Footprint Monthly Trend Area Chart */}
        <div className="glass-panel p-6 rounded-2xl shadow-glass lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-800">Monthly CO₂ Emission Trend</h3>
            <p className="text-xs text-slate-500">Breakdown of monthly logged activity emissions in kg CO₂.</p>
          </div>

          <div className="w-full h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                />
                <Area type="monotone" dataKey="CO2" name="Logged CO2 (kg)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCO2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-800">Footprint Category Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution of your recorded carbon footprint.</p>
          </div>

          <div className="w-full h-52 mt-6 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legends for grid mapping */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {displayPieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-3xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
