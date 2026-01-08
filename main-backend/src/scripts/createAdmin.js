import dotenv from 'dotenv';
import sequelize from '../config/database.js';
import { User } from '../models/index.js';

dotenv.config();

async function createAdmin() {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ 
      where: { email: 'admin@propbooking.com' } 
    });
    
    if (adminExists) {
      if ( config.nodeEnv === 'development' ) console.log('⚠️  Admin user already exists');
      process.exit(0);
    }
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@propbooking.com',
      password: 'Admin@123456', // Change this after first login!
      role: 'admin',
      status: 'Active'
    });

    if ( config.nodeEnv === 'development' ) console.log('✅ Admin user created successfully!');
    if ( config.nodeEnv === 'development' ) console.log('📧 Email:', admin.email);
    if ( config.nodeEnv === 'development' ) console.log('🔑 Password: Admin@123456');
    if ( config.nodeEnv === 'development' ) console.log('⚠️  IMPORTANT: Change this password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();