// src/config/paypal.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('paypal', () => ({
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'live' or 'sandbox'
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
}));

