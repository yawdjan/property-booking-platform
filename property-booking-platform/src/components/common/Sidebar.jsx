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
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-amber-900 to-amber-950 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-amber-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-amber-100">Omarey</h1>
              <p className="text-sm text-amber-300">{isAgent ? 'Agent Portal' : 'Admin Panel'}</p>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-amber-100 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary-400 text-white shadow-lg' 
                    : 'text-amber-100 hover:bg-amber-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}