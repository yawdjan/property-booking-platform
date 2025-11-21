import 'dotenv/config';

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },

  paymentApiUrl: process.env.PAYMENT_API_URL,
  wsPort: process.env.WS_PORT,
  frontendUrl: process.env.FRONTEND_URL,
  globalCommissionRate: parseFloat(process.env.GLOBAL_COMMISSION_RATE)
};

export default config;