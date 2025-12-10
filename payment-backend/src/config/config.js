import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 3001;
export const nodeEnv = process.env.NODE_ENV;
export const mongodb = {
  uri: process.env.MONGODB_URI
};
export const paystack = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  apiUrl: process.env.PAYSTACK_API_URL
};
export const mainBackendUrl = process.env.MAIN_BACKEND_URL;
export const frontendUrl = process.env.FRONTEND_URL;
export const paymentLinkExpiry = parseInt(process.env.PAYMENT_LINK_EXPIRY) || 24;