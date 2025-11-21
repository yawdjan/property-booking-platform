import axios from 'axios';
import { paystack} from '../config/config.js';
import crypto from 'crypto';

class PaystackService {
  constructor() {
    this.apiUrl = paystack.apiUrl;
    this.secretKey = paystack.secretKey;
    this.headers = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async initializeTransaction(data) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transaction/initialize`,
        {
          email: data.email,
          amount: Math.round(data.amount * 100), // Convert to kobo/cents
          reference: data.reference,
          callback_url: data.callbackUrl,
          metadata: data.metadata
        },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(`Failed to initialize payment ${error}`);
    }
  }

  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/transaction/verify/${reference}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify payment');
    }
  }

  async getTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/transaction/${transactionId}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      throw new Error('Failed to get transaction');
    }
  }

  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
}

export default new PaystackService();