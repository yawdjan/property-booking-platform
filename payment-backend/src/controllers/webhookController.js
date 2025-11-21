import crypto from 'crypto';
import Payment from '../models/Payment.js';
import PaymentLink from '../models/PaymentLink.js';
import axios from 'axios';
import { paystack, mainBackendUrl } from '../config/config.js';

export const handlePaystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', paystack.secretKey)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    
    console.log('Webhook event:', event.event);
    console.log('Webhook data:', event.data);

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, status, amount } = event.data;
      
      if (status === 'success') {
        // Update payment status
        const payment = await Payment.findOneAndUpdate(
          { reference },
          {
            status: 'Success',
            paidAt: new Date(),
            paystackResponse: event.data,
            gatewayResponse: event.data.gateway_response
          },
          { new: true }
        );

        if (payment) {
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
            console.log('Successfully notified main backend');
          } catch (error) {
            console.error('Error notifying main backend:', error.message);
          }
        }
      }
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};