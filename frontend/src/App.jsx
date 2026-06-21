import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';

// Lazy Loaded View Imports
const Login = React.lazy(() => import('./components/Auth/Login'));
const Register = React.lazy(() => import('./components/Auth/Register'));
const DashboardView = React.lazy(() => import('./components/Dashboard/DashboardView'));
const CalculatorView = React.lazy(() => import('./components/Calculator/CalculatorView'));
const TrackerView = React.lazy(() => import('./components/Tracker/TrackerView'));
const ChallengesView = React.lazy(() => import('./components/Challenges/ChallengesView'));
const CommunityView = React.lazy(() => import('./components/Community/CommunityView'));
const CarbonMapView = React.lazy(() => import('./components/CarbonMap/CarbonMapView'));
const AdminView = React.lazy(() => import('./components/Admin/AdminView'));

// Loading spinner fallback for lazy loading
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#edf5ef]">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Protected Route for Citizens
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Protected Route specifically for Admins
function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Citizen Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calculator" 
              element={
                <ProtectedRoute>
                  <CalculatorView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tracker" 
              element={
                <ProtectedRoute>
                  <TrackerView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/challenges" 
              element={
                <ProtectedRoute>
                  <ChallengesView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <CommunityView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute>
                  <CarbonMapView />
                </ProtectedRoute>
              } 
            />

            {/* Protected Administrator Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminView />
                </ProtectedAdminRoute>
              } 
            />

            {/* Redirect all unmatched routes to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
