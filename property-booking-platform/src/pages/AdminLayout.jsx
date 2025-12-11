import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import AdminDashboard from '../components/admin/AdminDashboard';
import AgentManagement from '../components/admin/AgentManagement';
import BookingManagement from '../components/admin/BookingManagement';
import CalendarManagement from '../components/admin/CalendarManagement';
import FinancialReports from '../components/admin/FinancialReports';
import PropertySettings from '../components/admin/PropertySettings';
import PayoutManagement from '../components/admin/PayoutManagement';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/admin/agents')) return 'agents';
    if (path.includes('/admin/bookings')) return 'bookings';
    if (path.includes('/admin/calendar')) return 'calendar';
    if (path.includes('/admin/financial')) return 'financial';
    if (path.includes('/admin/properties')) return 'properties';
    if (path.includes('/admin/payouts')) return 'payouts';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  // Navigate when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const routes = {
      dashboard: '/admin/dashboard',
      agents: '/admin/agents',
      bookings: '/admin/bookings',
      calendar: '/admin/calendar',
      financial: '/admin/financial',
      properties: '/admin/properties',
      payouts: '/admin/payouts'
    };
    navigate(routes[tabId]);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/agents" element={<AgentManagement />} />
            <Route path="/bookings" element={<BookingManagement />} />
            <Route path="/calendar" element={<CalendarManagement />} />
            <Route path="/financial" element={<FinancialReports />} />
            <Route path="/properties" element={<PropertySettings />} />
            <Route path="/payouts" element={<PayoutManagement />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}