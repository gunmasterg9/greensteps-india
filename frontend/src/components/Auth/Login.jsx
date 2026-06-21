import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogIn, Mail, Lock, ShieldAlert, Sparkles } from 'lucide-react';

export default function Login() {
  const { loginWithEmail, loginWithGoogle, isMock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }
    setError('');
    setAuthLoading(true);
    const res = await loginWithEmail(email, password);
    setAuthLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Failed to login. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setAuthLoading(true);
    const res = await loginWithGoogle();
    setAuthLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Failed to login with Google.');
    }
  };

  const autofillMock = (type) => {
    if (type === 'user') {
      setEmail('citizen@greensteps.in');
      setPassword('password123');
    } else {
      setEmail('admin@greensteps.in');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-100 via-[#edf5ef] to-brand-200">
      <div className="w-full max-w-md bg-white/85 backdrop-blur-md p-8 rounded-2xl shadow-glass border border-white/40">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg mb-2">
            <Leaf className="w-7 h-7 text-white fill-white/10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">GreenSteps India</h1>
          <p className="text-sm text-slate-500 text-center mt-1">
            Calculate, Track & Reduce Your Carbon Footprint
          </p>
        </div>

        {isMock && (
          <div className="mb-6 p-3.5 bg-brand-50/80 border border-brand-200 rounded-xl text-xs text-brand-800 leading-relaxed shadow-sm">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
              <span>Developer Mock Mode Active</span>
            </div>
            We have bypassed live Firebase verification. You can log in using any credentials or quick click below:
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => autofillMock('user')}
                className="px-2 py-1 bg-brand-200 hover:bg-brand-300 font-semibold text-brand-900 rounded transition-colors"
              >
                Standard Citizen
              </button>
              <button 
                onClick={() => autofillMock('admin')}
                className="px-2 py-1 bg-amber-200 hover:bg-amber-300 font-semibold text-amber-900 rounded transition-colors"
              >
                App Admin
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="citizen@greensteps.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4.5 h-4.5" />
            {authLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#fbfcfa] px-3 text-slate-400 uppercase tracking-widest font-semibold">Or Connect With</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          aria-label="Sign in with Google Account"
          className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 bg-white font-medium text-slate-700 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.97 1 12 1 7.24 1 3.2 3.65 1.22 7.55l3.87 3C6.01 7.42 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.62 2.81c2.12-1.95 3.77-4.82 3.77-8.44z"
            />
            <path
              fill="#FBBC05"
              d="M5.09 10.55c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.22 2.95C.44 4.51 0 6.28 0 8.15s.44 3.64 1.22 5.2l3.87-2.8z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.62-2.81c-1.01.67-2.3 1.07-4.34 1.07-3.22 0-5.99-2.38-6.91-5.51l-3.87 3C3.2 20.35 7.24 23 12 23z"
            />
          </svg>
          Google Account
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          New to GreenSteps?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold underline decoration-2">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
