import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeWebSocket, disconnectWebSocket, websocket } from '../services/websocket';
import { authAPI } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await authAPI.getMe();
          setCurrentUser(response.data);
          setCurrentView(response.data.role === 'admin' ? 'admin-dashboard' : 'agent-dashboard');
          
          // Initialize WebSocket
          initializeWebSocket(token);
          
          // Setup notification listener
          websocket.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 10));
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const login = async (userData) => {
    setCurrentUser(userData.user);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setCurrentView(userData.user.role === 'admin' ? 'admin-dashboard' : 'agent-dashboard');
    
    // Initialize WebSocket
    initializeWebSocket(userData.token);
    
    // Setup notification listener
    websocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 10));
    });
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    disconnectWebSocket();
    setCurrentUser(null);
    setCurrentView('landing');
    setNotifications([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      notifications, 
      setNotifications, 
      setCurrentView,
      currentView 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};