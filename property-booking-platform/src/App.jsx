import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import AdminLayout from './pages/AdminLayout';
import AgentLayout from './pages/AgentLayout';
import PaymentCallback from './pages/PaymentCallback';

function AppContent() {
  const { currentUser, currentView } = useApp();

  return (
    <Routes>
      {/* Public payment route - accessible to anyone */}
      <Route path="/pay/:paymentId" element={<PaymentPage />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />
      
      {/* Main app route */}
      <Route path="/*" element={
        <div className="min-h-screen bg-gray-50">
          {!currentUser && currentView === 'landing' && <LandingPage />}
          {!currentUser && currentView === 'register' && <RegisterPage />}
          {!currentUser && currentView === 'login' && <LoginPage />}
          {currentUser?.role === 'admin' && <AdminLayout />}
          {currentUser?.role === 'agent' && <AgentLayout />}
        </div>
      } />
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