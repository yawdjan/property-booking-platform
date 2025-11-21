import React, { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { currentUser, logout, notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800">Welcome, {currentUser?.name}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-10">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b hover:bg-gray-50">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.time).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={logout} 
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}