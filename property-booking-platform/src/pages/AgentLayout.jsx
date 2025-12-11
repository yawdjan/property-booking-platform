import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import AgentDashboard from '../components/agent/AgentDashboard';
import BookingCalendar from '../components/agent/BookingCalendar';
import MyBookings from '../components/agent/MyBookings';
import MyCommissions from '../components/agent/MyCommissions';

export default function AgentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/agent/book-property')) return 'calendar';
    if (path.includes('/agent/my-bookings')) return 'my-bookings';
    if (path.includes('/agent/commissions')) return 'commissions';
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
      dashboard: '/agent/dashboard',
      calendar: '/agent/book-property',
      'my-bookings': '/agent/my-bookings',
      commissions: '/agent/commissions'
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
        isAgent={true}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="/dashboard" element={<AgentDashboard setActiveTab={handleTabChange} />} />
            <Route path="/book-property" element={<BookingCalendar />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/commissions" element={<MyCommissions />} />
            <Route path="*" element={<Navigate to="/agent/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}