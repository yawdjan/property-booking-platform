import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import config from './config/config.js';
import sequelize from './config/database.js';
import { initializeWebSocket } from './websocket/socketHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeScheduler } from './services/scheduler.js';

// Import models
import './models/index.js';

// Routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import bookingRoutes from './routes/bookings.js';
import agentRoutes from './routes/agents.js';
import commissionRoutes from './routes/commissions.js';
import calendarRoutes from './routes/calendar.js';
import uploadRoutes from './routes/upload.js'; // Add this

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Middleware
app.use(cors());

// IMPORTANT: Increase body size limits for large files
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/upload', uploadRoutes); // Add this

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Database sync and server start
const PORT = config.port;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    
    // Initialize scheduler
    initializeScheduler();
    
    server.listen(PORT, () => {
      console.log(`🚀 Main Backend running on port ${PORT}`);
      console.log(`🔌 WebSocket ready on port ${PORT}`);
      console.log(`📁 File uploads: 50MB max per file`);
    });
  })
  .catch(err => {
    console.error('❌ Database sync failed:', err);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    sequelize.close();
    process.exit(0);
  });
});