import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  Activity, 
  Sparkles, 
  Trash2, 
  Plus, 
  Download,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function AdminView() {
  const { token } = useAuth();
  
  // Analytics State
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalChallenges: 0,
    totalActivities: 0,
    totalCarbonSavingsKg: 0,
    avgCarbonScorePerCapita: 0,
    totalCo2EmittedKg: 0
  });
  const [breakdown, setBreakdown] = useState([]);
  
  // User list State
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Challenge Form State
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cCategory, setCCategory] = useState('transport');
  const [cPoints, setCPoints] = useState('');
  const [cDuration, setCDuration] = useState('');
  const [cTarget, setCTarget] = useState('');
  const [cIcon, setCIcon] = useState('Leaf');

  const [challengeSuccess, setChallengeSuccess] = useState('');
  const [challengeError, setChallengeError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!token) return;
    try {
      // 1. Fetch Analytics
      const resAnal = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAnal.ok) {
        const data = await resAnal.json();
        setSummary(data.summary);
        setBreakdown(data.categoryBreakdown);
      }

      // 2. Fetch Users
      const resUsers = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resUsers.ok) {
        const users = await resUsers.json();
        setUsersList(users);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setChallengeSuccess('');
    setChallengeError('');

    if (!cTitle || !cDesc || !cPoints || !cDuration || !cTarget) {
      return setChallengeError('Please fill in all challenge fields.');
    }

    try {
      const res = await fetch(`${API_URL}/admin/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: cTitle,
          description: cDesc,
          category: cCategory,
          rewardPoints: Number(cPoints),
          durationDays: Number(cDuration),
          targetValue: Number(cTarget),
          iconName: cIcon
        })
      });

      const data = await res.json();
      if (res.ok) {
        setChallengeSuccess(data.message);
        setCTitle('');
        setCDesc('');
        setCPoints('');
        setCDuration('');
        setCTarget('');
        fetchAdminData(); // update stats
      } else {
        setChallengeError(data.message || 'Failed to create challenge.');
      }
    } catch (err) {
      setChallengeError('Network error connecting to backend.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this citizen and all their activity logs?')) return;
    setUserSuccess('');
    setUserError('');

    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setUserSuccess(data.message);
        fetchAdminData(); // refresh
      } else {
        setUserError(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      setUserError('Network error deleting user.');
    }
  };

  // Simulates downloading a user carbon footprint report as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'State', 'City', 'Carbon Score (kg/yr)', 'Green Points', 'Registered Date'];
    const rows = usersList.map(u => [
      u._id,
      u.name,
      u.email,
      u.state,
      u.city,
      u.carbonScore,
      u.greenPoints,
      u.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GreenSteps_Users_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Manage users, audit challenges, and review environmental statistics.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow hover:shadow-md cursor-pointer text-xs"
        >
          <Download className="w-4 h-4" />
          Export Users CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* General Stats Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-2xl shadow-glass flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 text-brand-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Citizens</span>
                <span className="text-2xl font-extrabold text-slate-800">{summary.totalUsers}</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl shadow-glass flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Logged Tasks</span>
                <span className="text-2xl font-extrabold text-slate-800">{summary.totalActivities}</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl shadow-glass flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Challenges Active</span>
                <span className="text-2xl font-extrabold text-slate-800">{summary.totalChallenges}</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl shadow-glass flex items-center gap-4 border-l-4 border-l-brand-500">
              <div>
                <span className="text-3xs font-extrabold text-brand-800 uppercase tracking-wider block">Cumulative Offsets</span>
                <span className="text-2xl font-black text-brand-700">{summary.totalCarbonSavingsKg.toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left/Middle: User list manager */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl shadow-glass border border-white/60 space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Citizen Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Edit or delete registered accounts.</p>
              </div>

              {userSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold">
                  {userSuccess}
                </div>
              )}

              {userError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                  {userError}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 pr-2">Name</th>
                      <th className="pb-3 px-2">Location</th>
                      <th className="pb-3 px-2">Carbon Score</th>
                      <th className="pb-3 px-2">Points</th>
                      <th className="pb-3 pl-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                    {usersList.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/50">
                        <td className="py-3 pr-2 font-bold text-slate-800">
                          {user.name}
                          {user.role === 'admin' && <span className="text-3xs font-extrabold text-red-700 bg-red-50 border border-red-200 px-1 rounded ml-1 uppercase">Admin</span>}
                        </td>
                        <td className="py-3 px-2">
                          {user.city}, {user.state}
                        </td>
                        <td className="py-3 px-2 font-semibold">
                          {user.carbonScore} kg/yr
                        </td>
                        <td className="py-3 px-2 text-amber-500 font-bold">
                          {user.greenPoints}
                        </td>
                        <td className="py-3 pl-2">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user.role === 'admin'}
                            className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Add Challenge Form */}
            <div className="glass-panel p-6 rounded-3xl shadow-glass border border-white/60 space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-brand-600" />
                  Publish Challenge
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Post a new task for the citizens community.</p>
              </div>

              {challengeSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{challengeSuccess}</span>
                </div>
              )}

              {challengeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                  <span>{challengeError}</span>
                </div>
              )}

              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Challenge Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Energy Adoption"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    placeholder="Describe how citizens participate..."
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                    <select
                      value={cCategory}
                      onChange={(e) => setCCategory(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                    >
                      <option value="transport">Transport</option>
                      <option value="electricity">Electricity</option>
                      <option value="lpg">LPG</option>
                      <option value="food">Food</option>
                      <option value="shopping">Shopping</option>
                      <option value="waste">Waste</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Icon Style</label>
                    <select
                      value={cIcon}
                      onChange={(e) => setCIcon(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                    >
                      <option value="Leaf">Leaf (Default)</option>
                      <option value="Bike">Bike / Transport</option>
                      <option value="Apple">Apple / Food</option>
                      <option value="Sparkles">Sparkles / Clean</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Reward pts</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={cPoints}
                      onChange={(e) => setCPoints(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Days</label>
                    <input
                      type="number"
                      placeholder="7"
                      value={cDuration}
                      onChange={(e) => setCDuration(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Target val</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={cTarget}
                      onChange={(e) => setCTarget(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow"
                >
                  <Plus className="w-4 h-4" />
                  Publish Challenge
                </button>
              </form>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
