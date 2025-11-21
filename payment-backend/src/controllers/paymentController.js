import axios from 'axios';
import crypto from 'crypto';
import PaymentLink from '../models/PaymentLink.js';
import Payment from '../models/Payment.js';
import paystackService from '../services/paystackService.js';
import { paymentLinkExpiry, frontendUrl, mainBackendUrl } from '../config/config.js';

export const createPaymentLink = async (req, res) => {
  try {
    const { bookingId, amount, clientEmail, propertyName, checkIn, checkOut } = req.body;

    // Check if payment link already exists for this booking
    const existingLink = await PaymentLink.findOne({ bookingId });
    if (existingLink && existingLink.status === 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Payment link already exists for this booking'
      });
    }

    // Generate unique reference and link ID
    const reference = `booking_${bookingId}_${Date.now()}`;
    const linkId = crypto.randomBytes(16).toString('hex');

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + paymentLinkExpiry);

    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeTransaction({
      email: clientEmail,
      amount: amount,
      reference: reference,
      callbackUrl: `${frontendUrl}/payment/callback?reference=${reference}`,
      metadata: {
        bookingId,
        propertyName,
        checkIn,
        checkOut
      }
    });

    if (!paystackResponse.status) {
      throw new Error('Failed to initialize payment with Paystack');
    }

    // Create payment link
    const paymentLink = await PaymentLink.create({
      linkId,
      bookingId,
      amount,
      clientEmail,
      propertyName,
      checkIn,
      checkOut,
      paymentUrl: paystackResponse.data.authorization_url,
      reference,
      expiresAt
    });

    // Create pending payment record
    await Payment.create({
      paymentId: `pay_${Date.now()}`,
      bookingId,
      linkId,
      reference,
      amount,
      clientEmail,
      status: 'Pending',
      paystackReference: paystackResponse.data.reference
    });

    res.status(201).json({
      success: true,
      data: {
        linkId: paymentLink.linkId,
        paymentLink: paymentLink.paymentUrl,
        expiresAt: paymentLink.expiresAt
      }
    });
  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    // Verify with Paystack
    const verification = await paystackService.verifyTransaction(reference);

    if (!verification.status || verification.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { reference },
      {
        status: 'Success',
        paidAt: new Date(),
        paystackResponse: verification.data,
        gatewayResponse: verification.data.gateway_response
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment link status
    await PaymentLink.findOneAndUpdate(
      { reference },
      {
        status: 'Paid',
        paidAt: new Date()
      }
    );

    // Notify main backend
    try {
      await axios.post(`${mainBackendUrl}/api/bookings/confirm-payment`, {
        bookingId: payment.bookingId,
        paymentId: payment.paymentId
      });
    } catch (error) {
      console.error('❌ Error notifying main backend:', error.message);
      // Don't fail the verification if notification fails
    }
    
    res.status(200).json({
      success: true,  // ← Make sure this is here!
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    console.error('❌ Error in verifyPayment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelPaymentLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    const paymentLink = await PaymentLink.findOneAndUpdate(
      { linkId, status: 'Active' },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!paymentLink) {
      return res.status(404).json({
        success: false,
        message: 'Payment link not found or already processed'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment link cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};