import { createClient } from '@supabase/supabase-js';
import { serverConfig } from './config.js';

if (!serverConfig.supabaseUrl || !serverConfig.supabaseKey) {
  throw new Error('Supabase configuration is missing');
}

export const supabase = createClient(
  serverConfig.supabaseUrl,
  serverConfig.supabaseKey
);

export async function saveOrder(orderData) {
  // First check if order already exists
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', orderData.order_id)
    .single();

  if (existingOrder) {
    console.log('Order already exists:', orderData.order_id);
    return existingOrder;
  }

  // Add expiry date one month from now
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  const orderWithExpiry = {
    ...orderData,
    expires_at: expiryDate.toISOString()
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([orderWithExpiry])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateSubscription(subscriptionData) {
  // Check if customer already has an active subscription
  if (subscriptionData.status === 'active') {
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', subscriptionData.customer_id)
      .eq('status', 'active')
      .not('id', 'eq', subscriptionData.id)
      .single();

    if (existingSubscription) {
      console.warn('Customer already has an active subscription:', existingSubscription.id);
      return existingSubscription;
    }
  }

  // Add expiry date one month from now for new/renewed subscriptions
  if (subscriptionData.status === 'active') {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    subscriptionData.expires_at = expiryDate.toISOString();
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert([subscriptionData])
    .select();

  if (error) throw error;
  return data[0];
}

export async function handleSubscriptionExpiry() {
  const now = new Date().toISOString();

  // Find expired subscriptions
  const { data: expiredSubscriptions, error: findError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('expires_at', now);

  if (findError) throw findError;

  for (const subscription of expiredSubscriptions || []) {
    try {
      // Update subscription status to expired
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      // Remove associated order records
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('subscription_id', subscription.id);

      if (deleteError) throw deleteError;

    } catch (error) {
      console.error(`Error processing expired subscription ${subscription.id}:`, error);
    }
  }
}

export async function getActiveSubscription(customerEmail) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customerEmail)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getOrderHistory(customerEmail) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', customerEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}