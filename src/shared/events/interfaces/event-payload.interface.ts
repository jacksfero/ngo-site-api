// src/events/interfaces/event-payload.interface.ts

/**
 * Common base structure for all email-related events.
 */
export interface BaseMailPayload {
  to: string | string[];
  // cc?: string | string[];
  //  bcc?: string | string[];
  subject: string;
  // template: string;
  context: Record<string, any>; // holds dynamic variables for templates
}

export interface BaseMailContactPayload {
  //to: string | string[];
  // cc?: string | string[];
  //  bcc?: string | string[];
  // subject: string;
  // template: string;
  context: Record<string, any>; // holds dynamic variables for templates
}

/**
 * Product created event payload (extends base payload).
 */
export interface ContactCreatedPayload extends BaseMailContactPayload {
  to: String;
  type: string;
  name: string;
  mobile?: string;
  message?: string;
  productName?: string;
  productId?: number;


}

/**
 * User created event payload (extends base payload).
 */
export interface UserCreatedPayload extends BaseMailPayload {
  userId: number;
  fullName: string;
  email: string;
}
export interface ResetPassCreatedPayload extends BaseMailContactPayload {

  name: string;
  to: string;

}

export interface OtpCreatedPayload extends BaseMailContactPayload {
  otp: string;
  name: string;
  to: string;
  type?: string;
}

/**
 * Product created event payload (extends base payload).
 */
export interface OrderPaymentFailedPayload extends BaseMailContactPayload {
  orderId: string;
  paymentGatway: string;
   paymentStatus: string;
   orderStatus: string;
  totalAmount: string;
  orderDate: string;
  name: String;
  to: string;
  testingNote?: string; // extra variable for debugging/testing
   items: Array<{
    productName: string;
     
  }>;
}

/**
 * Product created event payload (extends base payload).
 */
export interface ProductCreatedPayload extends BaseMailContactPayload {
  productId: string;
  productName: string;
  name: String;
  to: string;
  testingNote?: string; // extra variable for debugging/testing
}