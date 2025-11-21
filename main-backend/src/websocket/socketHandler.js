import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/index.js';

let io;

export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Join room based on user role
    socket.join(socket.user.role);
    socket.join(`user_${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const sendNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

export const broadcastToAdmins = (notification) => {
  if (io) {
    io.to('admin').emit('notification', notification);
  }
};

export const broadcastToAll = (notification) => {
  if (io) {
    io.emit('notification', notification);
  }
};