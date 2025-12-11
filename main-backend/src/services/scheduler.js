import cron from 'node-cron';
import { Booking } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Initialize scheduled tasks for the application
 */
export const initializeScheduler = () => {
  // Run every minute to check for expired pending payments
  cron.schedule('* * * * *', async () => {
    await checkExpiredPendingPayments();
  });

  console.log('⏰ Scheduler initialized - checking for expired pending payments every minute');
};

/**
 * Check for pending payment bookings that have exceeded 30 minutes
 * and cancel them automatically
 */
const checkExpiredPendingPayments = async () => {
  try {
    // Calculate the time 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find all pending payment bookings created before 30 minutes ago
    const expiredBookings = await Booking.findAll({
      where: {
        status: 'Pending Payment',
        createdAt: {
          [Op.lt]: thirtyMinutesAgo
        }
      }
    });

    if (expiredBookings.length > 0) {
      console.log(`🔔 Found ${expiredBookings.length} expired pending payment booking(s)`);

      // Cancel all expired bookings
      for (const booking of expiredBookings) {
        await booking.update({
          status: 'Cancelled',
          cancelledAt: new Date(),
          cancelledBy: null // System cancellation
        });

        console.log(`✅ Automatically cancelled expired booking: ${booking.id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking expired pending payments:', error.message);
  }
};

export default { initializeScheduler };
