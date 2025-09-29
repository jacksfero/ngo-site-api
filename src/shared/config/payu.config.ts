// src/config/payu.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('payu', () => ({
  key: process.env.PAYUMONEY_KEY,
  salt: process.env.PAYUMONEY_SALT,
  baseUrl: process.env.PAYU_BASE_URL,
}));

