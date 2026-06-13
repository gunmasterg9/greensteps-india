import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';

// View Imports
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DashboardView from './components/Dashboard/DashboardView';
import CalculatorView from './components/Calculator/CalculatorView';
import TrackerView from './components/Tracker/TrackerView';
import ChallengesView from './components/Challenges/ChallengesView';
import CommunityView from './components/Community/CommunityView';
import CarbonMapView from './components/CarbonMap/CarbonMapView';
import AdminView from './components/Admin/AdminView';

// Protected Route for Citizens
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf5ef]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf5ef]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
      </AuthProvider>
    </BrowserRouter>
  );
}
