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
  confirmPayment
} from '../controllers/bookingController.js';
import { protect, authorize, checkAgentActive } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/agent/:agentId', protect, getAgentBookings);
router.get('/:id', protect, getBooking);
router.post('/', protect, authorize('agent'), checkAgentActive, createBooking);
router.put('/:id', protect, updateBooking);
router.get('/unavailable-ranges/:propertyId', protect, authorize('agent'), unavailableBookingRanges);
router.get('/unavailable-dates/:propertyId', protect, authorize('agent'), unavailableBookingDates);
router.post('/:id/cancel', protect, cancelBooking);
router.post('/confirm-payment', confirmPayment); // Called by Payment Backend

export default router;