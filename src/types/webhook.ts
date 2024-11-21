export interface WebhookEvent {
  meta: {
    event_name: string;
    custom_data?: any;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      order_number: string;
      user_email: string;
      user_name: string;
      total: number;
      currency: string;
      status: string;
      test_mode: boolean;
      created_at: string;
      product_name: string;
      variant_name: string;
      subscription_id?: string;
      customer_id?: string;
      product_id?: string;
      variant_id?: string;
      renews_at?: string;
      ends_at?: string;
    };
  };
}

export interface Order {
  id: number;
  order_id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  total: number;
  currency: string;
  status: string;
  test_mode: boolean;
  created_at: string;
  product_name: string;
  variant_name: string;
  subscription_id?: string;
  processed: boolean;
}

export interface Subscription {
  id: string;
  status: string;
  renews_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  product_id: string;
  variant_id: string;
}