import React from 'react';
import { Home, Users, Calendar, DollarSign } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, isAgent = false }) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'agents', label: 'Agent Management', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'calendar', label: 'Master Calendar', icon: Calendar },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign },
    { id: 'properties', label: 'Properties', icon: Home }
  ];

  const agentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Book Property', icon: Calendar },
    { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
    { id: 'commissions', label: 'My Commissions', icon: DollarSign }
  ];

  const menuItems = isAgent ? agentMenuItems : adminMenuItems;

  if (!isSidebarOpen) return null;

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">PropBooking</h1>
        <p className="text-sm text-gray-600">{isAgent ? 'Agent Portal' : 'Admin Panel'}</p>
      </div>
      <nav className="px-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}