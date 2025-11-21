import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { mongodb as config } from './config.js';

//load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    if (!config.uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(config.uri, {
      dbName: 'property_booking_payments' // Explicitly set database name
    });
    
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;