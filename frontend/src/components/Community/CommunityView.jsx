import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users2, 
  MapPin, 
  Sparkles, 
  Trophy, 
  Share2, 
  ArrowRight,
  Printer,
  Leaf
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function CommunityView() {
  const { token, user } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [stateRankings, setStateRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('citizens'); // 'citizens' or 'states'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_URL}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setTopUsers(data.topUsers);
          setStateRankings(data.stateRankings);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const handleShare = () => {
    const text = `I am helping India reduce emissions with GreenSteps India! I have earned ${user?.greenPoints || 0} Green Points. Join me in calculating your footprint!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Users2 className="w-8 h-8 text-brand-600" />
            Community & Leaderboards
          </h1>
          <p className="text-slate-500 mt-1">See how citizens across Indian States are working together to save carbon emissions.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-xl border border-slate-200/10 shrink-0">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${activeTab === 'citizens' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Citizen Rankings
          </button>
          <button
            onClick={() => setActiveTab('states')}
            className={`px-4 py-2 font-bold text-xs rounded-lg transition-all cursor-pointer ${activeTab === 'states' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            State standings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Rankings Column */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl shadow-glass border border-white/60">
            {activeTab === 'citizens' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                    Top Green Citizens
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Ranked by total Green Points earned.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/50 text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-2">Rank</th>
                        <th className="pb-3 px-2">Name</th>
                        <th className="pb-3 px-2">Location</th>
                        <th className="pb-3 px-2">Carbon Footprint</th>
                        <th className="pb-3 pl-2">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {topUsers.map((u, idx) => {
                        const isSelf = user && u.name === user.name;
                        return (
                          <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-brand-50/40 font-semibold' : ''}`}>
                            <td className="py-3.5 pr-2 text-slate-400 font-bold">
                              #{idx + 1}
                            </td>
                            <td className="py-3.5 px-2 text-slate-700">
                              {u.name} {isSelf && <span className="text-2xs bg-brand-200 text-brand-900 px-1.5 py-0.5 rounded font-bold ml-1 uppercase">You</span>}
                            </td>
                            <td className="py-3.5 px-2 text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                              <span className="truncate">{u.city}, {u.state}</span>
                            </td>
                            <td className="py-3.5 px-2 text-slate-500">
                              {u.carbonScore ? `${u.carbonScore} kg/yr` : 'N/A'}
                            </td>
                            <td className="py-3.5 pl-2 font-extrabold text-amber-500 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 fill-amber-500/10" />
                              {u.greenPoints}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-600" />
                    Indian States Comparison
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Average footprint and estimated environmental savings per state.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/50 text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pr-2">State</th>
                        <th className="pb-3 px-2">Users</th>
                        <th className="pb-3 px-2">Avg Footprint</th>
                        <th className="pb-3 px-2">Avg Points</th>
                        <th className="pb-3 pl-2">Est. Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {stateRankings.map((state, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pr-2 font-bold text-slate-700">
                            {state.state}
                          </td>
                          <td className="py-3.5 px-2 text-slate-500">
                            {state.userCount}
                          </td>
                          <td className="py-3.5 px-2 font-semibold text-slate-600">
                            {state.avgCarbonScore} kg/yr
                          </td>
                          <td className="py-3.5 px-2 text-amber-500 font-bold">
                            {state.avgGreenPoints} pts
                          </td>
                          <td className="py-3.5 pl-2 font-extrabold text-brand-600">
                            {state.carbonSavings.toLocaleString()} kg CO₂
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Social Share & Certificate Drawer */}
          <div className="glass-panel p-6 rounded-3xl shadow-glass border border-white/60 space-y-6 text-center">
            
            {/* Citizen badge visual */}
            <div className="p-6 bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-2xl relative overflow-hidden border border-brand-600 shadow-lg flex flex-col items-center">
              <div className="w-14 h-14 bg-brand-500 rounded-full border border-brand-400 flex items-center justify-center mb-3 text-white shadow-inner">
                <Leaf className="w-8 h-8 fill-white/10" />
              </div>
              <h3 className="font-bold text-lg tracking-tight">Citizen Green Card</h3>
              <p className="text-3xs text-brand-300 font-semibold uppercase tracking-widest mt-0.5">{user?.state} • INDIA</p>
              
              <div className="w-full border-t border-brand-800/80 my-4"></div>
              
              <div className="w-full flex justify-around text-center text-xs">
                <div>
                  <span className="text-3xs text-brand-300 uppercase font-medium">Footprint</span>
                  <span className="block font-black text-sm text-brand-100">{user?.carbonScore || '2,400'} kg</span>
                </div>
                <div>
                  <span className="text-3xs text-brand-300 uppercase font-medium">Points</span>
                  <span className="block font-black text-sm text-amber-400">{user?.greenPoints || 0} pts</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-md">Showcase Your Progress</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Invite friends and relatives to log calculations. Let's make India a cleaner, greener place!
              </p>
            </div>

            {copied && (
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-3xs font-semibold">
                Copied Achievement details to Clipboard!
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleShare}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Copy Share Code
              </button>
              <button
                onClick={handlePrint}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 bg-white font-bold text-slate-700 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
