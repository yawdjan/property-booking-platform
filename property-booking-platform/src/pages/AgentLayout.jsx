import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import AgentDashboard from '../components/agent/AgentDashboard';
import BookingCalendar from '../components/agent/BookingCalendar';
import MyBookings from '../components/agent/MyBookings';
import MyCommissions from '../components/agent/MyCommissions';

export default function AgentLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
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
          {activeTab === 'dashboard' && <AgentDashboard setActiveTab={setActiveTab} />}
          {activeTab === 'calendar' && <BookingCalendar />}
          {activeTab === 'my-bookings' && <MyBookings />}
          {activeTab === 'commissions' && <MyCommissions />}
        </main>
      </div>
    </div>
  );
}