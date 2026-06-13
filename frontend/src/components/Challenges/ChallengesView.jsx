import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Trophy, 
  Bike, 
  Leaf, 
  Apple, 
  Sparkles, 
  Check, 
  Lock,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const ALL_BADGES = [
  { id: 'Earth Friend', name: 'Earth Friend', desc: 'Join the GreenSteps India initiative.', pointsNeeded: 0 },
  { id: 'Eco Champ', name: 'Eco Champ', desc: 'Earn over 200 Green Points.', pointsNeeded: 200 },
  { id: 'Plastic Master', name: 'Plastic Master', desc: 'Complete the Plastic Free challenge.', pointsNeeded: 100 },
  { id: 'No Master', name: 'No Master', desc: 'Complete the No Car Sunday challenge.', pointsNeeded: 150 },
  { id: 'Plant Master', name: 'Plant Master', desc: 'Complete the Plant Trees challenge.', pointsNeeded: 200 },
  { id: 'Eat Master', name: 'Eat Master', desc: 'Complete the Eat Local & Vegan challenge.', pointsNeeded: 80 }
];

export default function ChallengesView() {
  const { token, user, updateUserProfile } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track joined and completed challenges in local storage to simulate persistent states in mock/live
  const [joinedIds, setJoinedIds] = useState(() => {
    const saved = localStorage.getItem('gs_joined_challenges');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedIds, setCompletedIds] = useState(() => {
    const saved = localStorage.getItem('gs_completed_challenges');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchChallenges = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [token]);

  const handleJoin = async (id) => {
    try {
      const res = await fetch(`${API_URL}/challenges/${id}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedJoined = [...joinedIds, id];
        setJoinedIds(updatedJoined);
        localStorage.setItem('gs_joined_challenges', JSON.stringify(updatedJoined));
        fetchChallenges(); // update counts
      }
    } catch (err) {
      console.error('Error joining challenge:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/challenges/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Remove from joined, add to completed
        const updatedJoined = joinedIds.filter(item => item !== id);
        const updatedCompleted = [...completedIds, id];
        
        setJoinedIds(updatedJoined);
        setCompletedIds(updatedCompleted);
        
        localStorage.setItem('gs_joined_challenges', JSON.stringify(updatedJoined));
        localStorage.setItem('gs_completed_challenges', JSON.stringify(updatedCompleted));
        
        // Update local user points in context
        updateUserProfile(data.user);
        fetchChallenges();
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  };

  // Map icons
  const getChallengeIcon = (iconName) => {
    if (iconName === 'Bike') return Bike;
    if (iconName === 'Apple') return Apple;
    if (iconName === 'Sparkles') return Sparkles;
    return Leaf;
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-500 fill-amber-500/10" />
          Sustainability Challenges
        </h1>
        <p className="text-slate-500 mt-1">Join active citizen programs, log impact, and claim badges.</p>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((c) => {
            const Icon = getChallengeIcon(c.iconName);
            const isJoined = joinedIds.includes(c._id);
            const isCompleted = completedIds.includes(c._id);
            
            return (
              <div 
                key={c._id} 
                className={`
                  glass-panel p-6 rounded-3xl shadow-glass border border-white/60 flex flex-col justify-between transition-all hover-scale
                  ${isCompleted ? 'border-l-4 border-l-green-500' : isJoined ? 'border-l-4 border-l-amber-500 bg-amber-50/10' : 'border-l-4 border-l-brand-400'}
                `}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-brand-500/10 text-brand-600 rounded-2xl">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-500/10" />
                      {c.rewardPoints} Green Points
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{c.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100/60 flex items-center justify-between">
                  <div className="text-3xs text-slate-400 font-bold uppercase tracking-wider">
                    {c.participantsCount.toLocaleString()} participants • {c.durationDays} day{c.durationDays !== 1 ? 's' : ''}
                  </div>

                  {isCompleted ? (
                    <span className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 font-bold rounded-xl text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : isJoined ? (
                    <button
                      onClick={() => handleComplete(c._id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Claim Rewards
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(c._id)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm hover:shadow"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Badge Cabinet */}
      <div className="glass-panel p-6 rounded-3xl shadow-glass border border-white/60">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            Badge Gallery
          </h2>
          <p className="text-xs text-slate-500 mt-1">Unlock eco-badges by completing challenges and logging daily savings.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ALL_BADGES.map((b) => {
            // Check if user has this badge (user.badges is an array of strings matching badge names)
            // Or if they have completed the corresponding challenge
            const hasBadge = user?.badges?.some(userBadge => 
              userBadge.toLowerCase().includes(b.name.split(' ')[0].toLowerCase())
            ) || user?.badges?.includes(b.name);

            return (
              <div 
                key={b.id} 
                className={`
                  p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all
                  ${hasBadge 
                    ? 'bg-amber-500/10 border-amber-400/30 text-amber-900 shadow-inner' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'}
                `}
              >
                <div className={`
                  w-11 h-11 rounded-full flex items-center justify-center mb-2.5 shadow-sm border
                  ${hasBadge 
                    ? 'bg-amber-400 text-amber-900 border-amber-300' 
                    : 'bg-slate-200 text-slate-400 border-slate-300'}
                `}>
                  {hasBadge ? <Trophy className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>
                
                <h4 className="text-xs font-bold truncate max-w-full">{b.name}</h4>
                <p className="text-3xs text-slate-400 mt-1.5 leading-snug">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
