import React from 'react';
import { Home, Users, Calendar, DollarSign, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isAgent = false }) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'agents', label: 'Agent Management', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'calendar', label: 'Master Calendar', icon: Calendar },
    { id: 'financial', label: 'Financial Reports', icon: DollarSign },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'payouts', label: 'Payout Management', icon: DollarSign }
  ];

  const agentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Book Property', icon: Calendar },
    { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
    { id: 'commissions', label: 'My Commissions', icon: DollarSign }
  ];

  const menuItems = isAgent ? agentMenuItems : adminMenuItems;

  const handleMenuClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-primary-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header with gradient */}
        <div className="p-6 border-b border-primary-200 bg-gradient-to-br from-cream-500/30 via-primary-100/50 to-secondary-100/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
                Omarey
              </h1>
              <p className="text-sm text-gray-600">{isAgent ? 'Agent Portal' : 'Admin Panel'}</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-secondary-500 to-accent-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-cream-500/30 hover:to-primary-100/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}