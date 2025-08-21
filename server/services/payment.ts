import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createPaymentOrder(amount: number, receipt: string): Promise<PaymentOrder> {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt,
      payment_capture: true,
    });

    return {
      id: order.id,
      amount: (order.amount as number) / 100,
      currency: order.currency,
      status: order.status,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create payment order');
  }
}

export function verifyPaymentSignature(
  paymentId: string,
  orderId: string,
  signature: string
): boolean {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment signature verification error:', error);
    return false;
  }
}

export async function getPaymentDetails(paymentId: string) {
  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    console.error('Razorpay payment fetch error:', error);
    throw new Error('Failed to fetch payment details');
  }
}
