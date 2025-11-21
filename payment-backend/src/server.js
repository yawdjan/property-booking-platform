import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { port } from './config/config.js';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Payment server is running',
    database: 'connected'
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = port;

app.listen(PORT, () => {
  console.log(`🚀 Payment Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  process.exit(0);
});