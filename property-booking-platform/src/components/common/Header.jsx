// Header.js
import React, { useState } from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header({ isSidebarOpen, setIsSidebarOpen}) {
  const { currentUser, logout, notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    // Clean white header with subtle shadow
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          <span className="hidden sm:inline">Welcome, </span>
          {currentUser?.name}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Minimalistic notification bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-400 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40 md:hidden"
                onClick={() => setShowNotifications(false)}
              />
              
              {/* Clean white notification dropdown */}
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center text-sm">No notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-900">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
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
        
        {/* Minimalistic logout button */}
        <button 
          onClick={logout} 
          className="flex items-center gap-2 px-3 md:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}