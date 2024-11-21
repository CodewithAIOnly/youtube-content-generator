import React, { useState, useEffect } from 'react';
import { CreditCard, Package, Loader2, AlertCircle, Bell, ArrowUpRight } from 'lucide-react';
import { getProducts, subscribeToPaymentEvents, type LemonSqueezyProduct, type WebhookEvent } from '../../services/lemonsqueezy';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { SubscriptionCard } from './SubscriptionCard';
import { BillingHistory } from './BillingHistory';
import { supabase } from '../../lib/supabase';

export function BillingSettings() {
  const [products, setProducts] = useState<LemonSqueezyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { preferences, updateSubscription } = useUserStore();
  const { user } = useAuthStore();
  const [paymentHistory, setPaymentHistory] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsData = await getProducts();
        setProducts(productsData);

        // Fetch order history
        if (user?.email) {
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_email', user.email)
            .eq('status', 'paid')
            .order('created_at', { ascending: false });

          if (orders) {
            const formattedOrders = orders.map(order => ({
              meta: { event_name: 'order_created' },
              data: {
                id: order.order_id,
                type: 'order',
                attributes: {
                  status: order.status,
                  created_at: order.created_at,
                  first_order_item: {
                    product_name: order.product_name
                  }
                }
              }
            }));
            setPaymentHistory(formattedOrders);

            // If there's at least one paid order, activate the plan
            if (orders.length > 0) {
              const latestOrder = orders[0];
              updateSubscription({
                id: latestOrder.subscription_id || String(latestOrder.id),
                plan: latestOrder.product_name,
                status: 'active',
                renewalDate: new Date(latestOrder.created_at).toISOString()
              });
            }
          }
        }
      } catch (err) {
        setError('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to payment events
    const unsubscribe = subscribeToPaymentEvents((event: WebhookEvent) => {
      handlePaymentEvent(event);
      // Add event to payment history
      setPaymentHistory(prev => [event, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, [user, updateSubscription]);

  const handlePaymentEvent = (event: WebhookEvent) => {
    const { event_name } = event.meta;
    const { attributes } = event.data;

    // Only process events for the current user
    if (user?.email && attributes.user_email !== user.email) {
      return;
    }

    switch (event_name) {
      case 'order_created':
        if (attributes.status === 'paid') {
          updateSubscription({
            id: event.data.id,
            plan: attributes.first_order_item?.product_name || 'Premium Plan',
            status: 'active',
            renewalDate: attributes.created_at
          });
          toast.success('Payment processed successfully!');
        }
        break;

      case 'subscription_created':
        if (attributes.status === 'active') {
          updateSubscription({
            id: event.data.id,
            plan: attributes.first_order_item?.product_name || 'Premium Plan',
            status: 'active',
            renewalDate: attributes.renews_at
          });
          toast.success('Subscription activated successfully!');
        }
        break;

      case 'subscription_updated':
        updateSubscription({
          id: event.data.id,
          plan: attributes.first_order_item?.product_name || 'Premium Plan',
          status: 'active',
          renewalDate: attributes.renews_at
        });
        toast.success('Subscription updated successfully!');
        break;

      case 'subscription_cancelled':
        updateSubscription({
          id: event.data.id,
          plan: attributes.first_order_item?.product_name || 'Premium Plan',
          status: 'canceled',
          renewalDate: attributes.ends_at
        });
        toast.info('Subscription cancelled');
        break;

      case 'subscription_expired':
        updateSubscription(undefined);
        toast.info('Subscription expired');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Subscription Plans</h3>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Current Plan</h4>
          <SubscriptionCard subscription={preferences.subscription} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-6 flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.attributes.name}
                </h3>
                {/* <p className="text-gray-500 text-sm mb-4">
                  {product.attributes.description}
                </p> */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.attributes.price_formatted}
                  </span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>

              <a
                href={`${product.attributes.buy_now_url}?checkout[email]=${encodeURIComponent(user?.email || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {preferences.subscription?.plan === product.attributes.name
                  ? 'Manage Subscription'
                  : 'Subscribe Now'}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Payment History</h4>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center">
              <Bell className="w-4 h-4 mr-1" />
              Notification Settings
            </button>
          </div>
          <BillingHistory payments={paymentHistory} />
        </div>
      </div>
    </div>
  );
}