// dto/payment-callback-result.ts
import { PaymentStatus } from 'src/shared/entities/payment.entity';

export interface PaymentCallbackResult {
  /** Whether payment was successful */
  success: boolean;

  /** Unique transaction ID (from gateway) */
  txnId: string;

  /** Amount paid (optional for failures) */
  amount?: number;

  /** Final status of the payment */
  status: PaymentStatus;

  /** Extra message or error reason */
  message?: string;

  /** Raw response from gateway (optional) */
  raw?: any;
}
