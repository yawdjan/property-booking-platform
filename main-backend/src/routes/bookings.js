import express from 'express';
import {
  getAllBookings,
  getAgentBookings,
  getBooking,
  createBooking,
  updateBooking,
  unavailableBookingDates,
  unavailableBookingRanges,
  cancelBooking,
  confirmPayment,
  updateExpiredBookings,
  getBookingPublic,
} from '../controllers/bookingController.js';
import { protect, authorize, checkAgentActive } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/agent/:agentId', protect, getAgentBookings);
router.get('/:id', protect, getBooking);
router.get('/public/:id', getBookingPublic); // Public route to get booking by public ID
router.get('/unavailable-ranges/:propertyId', protect, unavailableBookingRanges);
router.get('/unavailable-dates/:propertyId', protect, unavailableBookingDates);
router.post('/', protect, authorize('agent'), checkAgentActive, createBooking);
router.post('/:id/cancel', protect, cancelBooking);
router.post('/confirm-payment', confirmPayment); // Called by Payment Backend
router.post('/update-expired', protect, updateExpiredBookings); // New route to update expired bookings
router.put('/:id', protect, updateBooking);

export default router;