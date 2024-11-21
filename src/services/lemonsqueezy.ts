import axios from 'axios';
import CryptoJS from 'crypto-js';
import { io } from 'socket.io-client';

const LEMONSQUEEZY_CONFIG = {
  API_KEY: import.meta.env.VITE_LEMONSQUEEZY_API_KEY,
  URL: 'https://api.lemonsqueezy.com/v1',
  STORE_ID: import.meta.env.VITE_LEMONSQUEEZY_STORE_ID,
  WEBHOOK_URL: import.meta.env.VITE_LEMONSQUEEZY_WEBHOOK_URL
};

const headers = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
  Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.API_KEY}`,
};

// Initialize Socket.IO client
const socket = io(LEMONSQUEEZY_CONFIG.WEBHOOK_URL);

export interface LemonSqueezyProduct {
  id: string;
  attributes: {
    name: string;
    description: string;
    price_formatted: string;
    buy_now_url: string;
    large_thumb_url: string;
  };
}

export interface WebhookEvent {
  meta: {
    event_name: string;
    custom_data?: any;
  };
  data: {
    id: string;
    type: string;
    attributes: any;
  };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = CryptoJS.HmacSHA256(payload, LEMONSQUEEZY_CONFIG.WEBHOOK_URL);
  const computedSignature = CryptoJS.enc.Hex.stringify(hash);
  return computedSignature === signature;
}

export function subscribeToPaymentEvents(callback: (event: WebhookEvent) => void) {
  socket.on('payment_event', (event: WebhookEvent) => {
    callback(event);
  });

  return () => {
    socket.off('payment_event');
  };
}

export async function getProducts() {
  try {
    const response = await axios.get<{ data: LemonSqueezyProduct[] }>(
      `${LEMONSQUEEZY_CONFIG.URL}/products`,
      { headers }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Lemonsqueezy products:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const response = await axios.get(
      `${LEMONSQUEEZY_CONFIG.URL}/subscriptions/${subscriptionId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await axios.delete(
      `${LEMONSQUEEZY_CONFIG.URL}/subscriptions/${subscriptionId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function verifySubscriptionAccess(subscriptionId: string, customerEmail: string): Promise<boolean> {
  try {
    const subscription = await getSubscription(subscriptionId);
    return subscription.data.attributes.user_email.toLowerCase() === customerEmail.toLowerCase();
  } catch {
    return false;
  }
}