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
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    
    console.log('🔔 Webhook event received:', event.event);
    console.log('📊 Webhook data:', JSON.stringify(event.data, null, 2));

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, status, amount } = event.data;
      
      if (status === 'success') {
        console.log('✅ Processing successful payment with reference:', reference);
        
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
          console.log('💾 Payment updated in database:', payment._id);
          
          // Update payment link status
          await PaymentLink.findOneAndUpdate(
            { reference },
            {
              status: 'Paid',
              paidAt: new Date()
            }
          );
          console.log('🔗 Payment link updated');

          // Notify main backend
          try {
            console.log(`🌐 Calling main backend at ${mainBackendUrl}/bookings/confirm-payment`);
            const response = await axios.post(`${mainBackendUrl}/bookings/confirm-payment`, {
              bookingId: payment.bookingId,
              paymentId: payment.paymentId
            }, {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });
            console.log('✅ Successfully notified main backend:', response.data);
          } catch (error) {
            console.error('❌ Error notifying main backend:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
              url: `${mainBackendUrl}/api/bookings/confirm-payment`
            });
          }
        } else {
          console.warn('⚠️ Payment not found with reference:', reference);
        }
      }
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};