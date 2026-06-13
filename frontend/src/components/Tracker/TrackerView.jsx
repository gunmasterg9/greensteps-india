import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bus, 
  Lightbulb, 
  Flame, 
  Apple, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  History, 
  Calendar,
  Award,
  Sparkles,
  Info
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function TrackerView() {
  const { token, updateUserProfile } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [category, setCategory] = useState('transport');
  const [value, setValue] = useState('');
  const [subtype, setSubtype] = useState('twoWheeler');
  const [unit, setUnit] = useState('km');
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch activities on load
  const fetchActivities = async () => {
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
      console.error('Error loading tracker logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [token]);

  // Handle category swap (adjusts units and default subtypes)
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setErrorMessage('');
    setSuccessMessage('');
    setValue('');

    if (cat === 'transport') {
      setSubtype('twoWheeler');
      setUnit('km');
    } else if (cat === 'electricity') {
      setSubtype('default');
      setUnit('kWh');
    } else if (cat === 'lpg') {
      setSubtype('default');
      setUnit('cylinders');
    } else if (cat === 'food') {
      setSubtype('vegetarian');
      setUnit('meals');
    } else if (cat === 'shopping') {
      setSubtype('default');
      setUnit('items');
    } else if (cat === 'waste') {
      setSubtype('landfill');
      setUnit('kg');
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!value || Number(value) <= 0) {
      return setErrorMessage('Please enter a valid amount greater than 0.');
    }

    setFormSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          value: Number(value),
          unit,
          subtype
        })
      });

      const data = await res.json();
      setFormSubmitting(false);

      if (res.ok) {
        setSuccessMessage(data.message);
        setValue('');
        
        // Refresh logs list
        fetchActivities();

        // Also fetch profile update status to refresh local user context green points!
        const profileRes = await fetch(`${API_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // Update profile details inside AuthContext
          updateUserProfile(profileData);
        }
      } else {
        setErrorMessage(data.message || 'Failed to record activity.');
      }
    } catch (err) {
      setFormSubmitting(false);
      setErrorMessage('Network error communicating with backend server.');
    }
  };

  const categoryIcons = {
    transport: Bus,
    electricity: Lightbulb,
    lpg: Flame,
    food: Apple,
    shopping: ShoppingBag,
    waste: Trash2
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Form: Log New Activities */}
      <div className="glass-panel p-6 rounded-3xl shadow-glass border border-white/60">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5.5 h-5.5 text-brand-600" />
            Log Eco Activity
          </h2>
          <p className="text-xs text-slate-500 mt-1">Record actions to calculate carbon savings and earn points.</p>
        </div>

        {/* Category selector pills */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {['transport', 'electricity', 'lpg', 'food', 'shopping', 'waste'].map((cat) => {
            const Icon = categoryIcons[cat];
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`
                  py-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-xs font-bold
                  ${isSelected 
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/10' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize text-3xs">{cat === 'lpg' ? 'LPG' : cat}</span>
              </button>
            );
          })}
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogSubmit} className="space-y-4">
          
          {/* Dynamic input label / suboptions */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {category === 'transport' && 'Distance Travelled (km)'}
              {category === 'electricity' && 'Power Consumed (kWh / Units)'}
              {category === 'lpg' && 'Cylinders Consumed'}
              {category === 'food' && 'Number of Meals'}
              {category === 'shopping' && 'New Items Purchased'}
              {category === 'waste' && 'Garbage Weight (kg)'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="e.g. 15"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/70"
              />
              <span className="absolute right-3.5 inset-y-0 flex items-center font-bold text-xs text-slate-400 capitalize">
                {unit}
              </span>
            </div>
          </div>

          {/* Type Subselection */}
          {category === 'transport' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transit Vehicle Type</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/70 text-sm"
              >
                <option value="petrolCar">Petrol Car</option>
                <option value="dieselCar">Diesel Car</option>
                <option value="twoWheeler">Two-Wheeler (Motorbike)</option>
                <option value="ev">Electric Vehicle (EV)</option>
                <option value="bus">Public Transport Bus</option>
                <option value="metro">Metro / Local Train</option>
              </select>
            </div>
          )}

          {category === 'food' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Meal Preference Type</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/70 text-sm"
              >
                <option value="highMeat">Regular Meal (Meat/Eggs)</option>
                <option value="vegetarian">Vegetarian Meal</option>
                <option value="vegan">Vegan / Plant-based Meal</option>
              </select>
            </div>
          )}

          {category === 'waste' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Waste Treatment Type</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/70 text-sm"
              >
                <option value="landfill">Mixed Landfill Waste</option>
                <option value="organic">Organic Composting</option>
                <option value="recyclable">Dry Recycling</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={formSubmitting}
            className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Award className="w-4.5 h-4.5" />
            {formSubmitting ? 'Recording...' : 'Log Activity'}
          </button>

        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-2xs text-slate-400 flex items-start gap-1.5 leading-normal">
          <Info className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span>Each logged activity earns you base Green Points. Clean, low-carbon transits, recycling, or vegan meals yield bonus scores!</span>
        </div>
      </div>

      {/* Right Column: Historical Logs Data Table */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-3xl shadow-glass border border-white/60">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5.5 h-5.5 text-brand-600" />
              Activity History
            </h2>
            <p className="text-xs text-slate-500 mt-1">Audit trail of all your logged actions.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 border rounded-lg text-slate-600">
            {activities.length} Total Logs
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No logs found.</p>
            <p className="text-xs text-slate-400 mt-1">Start logging carbon footprints on the left panel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-2">Category</th>
                  <th className="pb-3 px-2">Details</th>
                  <th className="pb-3 px-2">Emissions</th>
                  <th className="pb-3 pl-2">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activities.map((act) => {
                  const Icon = categoryIcons[act.category] || Info;
                  return (
                    <tr key={act._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-2 font-bold text-slate-700 flex items-center gap-2 capitalize">
                        <span className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        {act.category === 'lpg' ? 'LPG' : act.category}
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {act.value} {act.unit} 
                        {act.category === 'transport' && ` (${act.value} km via ${act.category})`}
                        {act.category === 'food' && ` (${act.value} meals)`}
                        {act.category === 'waste' && ` (${act.value} kg)`}
                      </td>
                      <td className="py-3 px-2 font-bold text-red-600">
                        +{act.co2Emission} kg CO₂
                      </td>
                      <td className="py-3 pl-2 text-slate-400">
                        {new Date(act.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
