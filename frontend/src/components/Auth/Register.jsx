import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { statesAndUTs, stateCities } from '../../utils/indiaData';
import { Leaf, UserPlus, Mail, Lock, User, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

export default function Register() {
  const { registerWithEmail, isMock } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity(''); // Reset city when state changes
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !selectedState || !selectedCity) {
      return setError('Please fill in all fields.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setError('');
    setAuthLoading(true);
    const res = await registerWithEmail(name, email, password, selectedState, selectedCity);
    setAuthLoading(false);
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  // Get cities for current selected state
  const cities = selectedState ? stateCities[selectedState] || [] : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-100 via-[#edf5ef] to-brand-200">
      <div className="w-full max-w-md bg-white/85 backdrop-blur-md p-8 rounded-2xl shadow-glass border border-white/40">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
            <Leaf className="w-7 h-7 text-white fill-white/10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Join GreenSteps</h1>
          <p className="text-sm text-slate-500 text-center mt-1">
            Start logging your eco-activities & saving emissions
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="name"
                type="text"
                placeholder="Rahul Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="state" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                State / UT
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <select
                  id="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70 text-sm appearance-none"
                >
                  <option value="">Select State</option>
                  {statesAndUTs.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                City / District
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <select
                  id="city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70 text-sm appearance-none disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4.5 h-4.5" />
            {authLoading ? 'Creating Profile...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold underline decoration-2">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
