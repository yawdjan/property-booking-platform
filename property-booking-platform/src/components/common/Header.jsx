// Header.js
import React, { useState } from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header({ isSidebarOpen, setIsSidebarOpen}) {
  const { currentUser, logout, notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-gradient-to-r from-amber-900 to-amber-800 shadow-lg px-4 md:px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Hamburger menu for mobile */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-amber-700 rounded-lg md:hidden text-amber-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Desktop hamburger */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:hidden p-2 hover:bg-amber-700 rounded-lg text-amber-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h2 className="text-lg md:text-xl font-semibold text-amber-50">
          <span className="hidden sm:inline">Welcome, </span>
          {currentUser?.name}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 hover:bg-amber-700 rounded-lg text-amber-100"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-400 rounded-full ring-2 ring-amber-900"></span>
            )}
          </button>
          
          {showNotifications && (
            <>
              {/* Backdrop for mobile */}
              <div 
                className="fixed inset-0 z-40 md:hidden"
                onClick={() => setShowNotifications(false)}
              />
              
              {/* Notification dropdown */}
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border-2 border-amber-200 z-50">
                <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <h3 className="font-semibold text-amber-950">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-amber-700 text-center">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-amber-100 hover:bg-amber-50">
                        <p className="text-sm text-amber-950">{notif.message}</p>
                        <p className="text-xs text-amber-700 mt-1">
                          {new Date(notif.time).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Logout button */}
        <button 
          onClick={logout} 
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-amber-100 hover:bg-amber-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}