import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import PaymentCallback from './pages/PaymentCallback';

// Admin pages
import AdminLayout from './pages/AdminLayout';

// Agent pages
import AgentLayout from './pages/AgentLayout';
import PropertyDetail from './pages/PropertyDetail';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/listings" element={<LandingPage defaultTab="listings" />} />
      <Route path="/services" element={<LandingPage defaultTab="services" />} />
      <Route path="/aboutus" element={<LandingPage defaultTab="aboutus" />} />
      <Route path="/listings/:id" element={<PropertyDetail />} />
      <Route path="/pay/:paymentId" element={<PaymentPage />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />

      {/* Admin Routes with nested paths */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Agent Routes with nested paths */}
      <Route
        path="/agent/*"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentLayout />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}