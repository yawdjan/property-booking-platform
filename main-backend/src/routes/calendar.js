import express from 'express';
import { getAvailability, blockDates } from '../controllers/calendarController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/availability', getAvailability);
router.post('/block', protect, authorize('admin'), blockDates);

export default router;