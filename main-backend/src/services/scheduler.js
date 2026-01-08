import cron from 'node-cron';
import { Booking, Property, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Auto-cancel bookings that have been in "Pending Payment" for more than 30 minutes
 */
export const cancelExpiredPendingBookings = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    if ( process.env.NODE_ENV === 'development' ) console.log('🔍 Checking for expired pending bookings...');
    
    // Find all bookings in Pending Payment status that were created more than 30 minutes ago
    const expiredBookings = await Booking.findAll({
      where: {
        status: 'Pending Payment',
        createdAt: {
          [Op.lt]: thirtyMinutesAgo
        }
      },
      include: [
        { model: Property, as: 'property', attributes: ['name'] },
        { model: User, as: 'agent', attributes: ['name', 'email'] }
      ]
    });

    if (expiredBookings.length === 0) {
      if ( process.env.NODE_ENV === 'development' ) console.log('✅ No expired pending bookings found');
      return {
        success: true,
        cancelledCount: 0
      };
    }

    if ( process.env.NODE_ENV === 'development' ) console.log(`⚠️ Found ${expiredBookings.length} expired pending booking(s)`);

    // Cancel each expired booking
    let cancelledCount = 0;
    for (const booking of expiredBookings) {
      try {
        await booking.update({
          status: 'Cancelled',
          cancelledAt: new Date(),
          cancelledBy: null, // System-initiated cancellation
        });

        if ( process.env.NODE_ENV === 'development' ) console.log(`❌ Auto-cancelled booking #${booking.id} for ${booking.property?.name || 'Unknown Property'}`);
        cancelledCount++;

        // TODO: Optional - Send notification to agent about auto-cancellation
        // await sendAgentNotification(booking);
        
      } catch (error) {
        console.error(`❌ Failed to cancel booking #${booking.id}:`, error.message);
      }
    }

    if ( process.env.NODE_ENV === 'development' ) console.log(`✅ Successfully cancelled ${cancelledCount} expired pending booking(s)`);
    
    return {
      success: true,
      cancelledCount
    };
    
  } catch (error) {
    console.error('❌ Error in cancelExpiredPendingBookings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mark bookings as "Completed" when checkout date has passed
 */
export const completeExpiredBookings = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    if ( process.env.NODE_ENV === 'development' ) console.log('🔍 Checking for bookings to mark as completed...');
    
    const result = await Booking.update(
      { status: 'Completed' },
      {
        where: {
          status: 'Booked',
          checkOut: { [Op.lt]: today }
        }
      }
    );

    const completedCount = result[0]; // Number of affected rows
    
    if (completedCount > 0) {
      if ( process.env.NODE_ENV === 'development' ) console.log(`✅ Marked ${completedCount} booking(s) as Completed`);
    } else {
      if ( process.env.NODE_ENV === 'development' ) console.log('✅ No bookings to complete');
    }
    
    return {
      success: true,
      completedCount
    };
    
  } catch (error) {
    console.error('❌ Error in completeExpiredBookings:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduler = () => {
  if ( process.env.NODE_ENV === 'development' ) console.log('🕐 Initializing scheduler...');

  // Run every 5 minutes - Auto-cancel expired pending bookings
  cron.schedule('*/5 * * * *', async () => {
    if ( process.env.NODE_ENV === 'development' ) console.log('⏰ Running scheduled job: Cancel expired pending bookings');
    await cancelExpiredPendingBookings();
  });

  // Run every day at 00:30 AM - Complete bookings with past checkout dates
  cron.schedule('30 0 * * *', async () => {
    if ( process.env.NODE_ENV === 'development' ) console.log('⏰ Running scheduled job: Complete expired bookings');
    await completeExpiredBookings();
  });

  if ( process.env.NODE_ENV === 'development' ) console.log('✅ Scheduler initialized successfully');
  if ( process.env.NODE_ENV === 'development' ) console.log('   - Auto-cancel pending bookings: Every 5 minutes');
  if ( process.env.NODE_ENV === 'development' ) console.log('   - Complete past bookings: Daily at 00:30 AM');
  
  // Run immediately on startup for testing
  setTimeout(() => {
    if ( process.env.NODE_ENV === 'development' ) console.log('🚀 Running initial check on startup...');
    cancelExpiredPendingBookings();
    completeExpiredBookings();
  }, 5000); // Wait 5 seconds after server start
};

export default {
  initializeScheduler,
  cancelExpiredPendingBookings,
  completeExpiredBookings
};