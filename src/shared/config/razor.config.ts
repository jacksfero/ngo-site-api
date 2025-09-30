 
import { registerAs } from '@nestjs/config';

export default registerAs('razorpay', () => ({
  keyId: process.env.RAZORPAY_KEY_ID,
  secret: process.env.RAZORPAY_KEY_SECRET,
}));

 // this.razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RLjYNYOCQ9UFUt',
    //   key_secret: process.env.RAZORPAY_KEY_SECRET || 'jFVL2nI2OiE3MHd9kGH5dBbQ',
    // });
