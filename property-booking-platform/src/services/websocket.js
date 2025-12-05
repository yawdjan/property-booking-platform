import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3001';

let socket = null;

export const initializeWebSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(WS_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const websocket = {
  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },
  
  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  },
  
  off: (event) => {
    if (socket) {
      socket.off(event);
    }
  }
};