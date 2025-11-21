import express from 'express';
import { body } from 'express-validator';   
import {
  createPaymentLink,
  getPaymentStatus,
  verifyPayment,
  cancelPaymentLink
} from '../controllers/paymentController.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post('/create-link', [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('clientEmail').isEmail().withMessage('Valid email is required'),
  body('propertyName').notEmpty().withMessage('Property name is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  validate
], createPaymentLink);

router.get('/:reference/status', getPaymentStatus);

router.post('/verify', [
  body('reference').notEmpty().withMessage('Reference is required'),
  validate
], verifyPayment);

router.post('/:linkId/cancel', cancelPaymentLink);

export default router;