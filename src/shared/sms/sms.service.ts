import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private apiUrl: string;
  private apiKey: string;
  private senderId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.requireEnv('SMS_API_URL');
    this.apiKey = this.requireEnv('SMS_OTP_API_KEY');
    this.senderId = this.requireEnv('SMS_SENDER_ID');
  }

  private requireEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  async sendSms(number: string | string[], message: string, templateId: string) {
    try {
      const numbersArray = Array.isArray(number) ? number : [number];

      const payload = {
        message,
        senderId: this.senderId,
        number: numbersArray,
        templateId,
      };

      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      };

      const response = await axios.post(this.apiUrl, payload, { headers });
      console.log('------sms API Return-----',response.data);
      return response.data;
    } catch (error) {
      console.error('SMS Sending Error:', error?.response?.data || error);
      throw new HttpException(
        'Failed to send SMS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}