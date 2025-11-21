import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import AdminDashboard from '../components/admin/AdminDashboard';
import AgentManagement from '../components/admin/AgentManagement';
import BookingManagement from '../components/admin/BookingManagement';
import CalendarManagement from '../components/admin/CalendarManagement';
import FinancialReports from '../components/admin/FinancialReports';
import PropertySettings from '../components/admin/PropertySettings';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'agents' && <AgentManagement />}
          {activeTab === 'bookings' && <BookingManagement />}
          {activeTab === 'calendar' && <CalendarManagement />}
          {activeTab === 'financial' && <FinancialReports />}
          {activeTab === 'properties' && <PropertySettings />}
        </main>
      </div>
    </div>
  );
}