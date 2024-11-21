import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import CryptoJS from 'crypto-js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { serverConfig } from './config.js';
import { saveOrder, updateSubscription, handleSubscriptionExpiry } from './database.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.raw({ type: 'application/json' }));

// Store socket instance
app.set('io', io);

// Verify Lemon Squeezy webhook signature
function verifyWebhookSignature(payload, signature) {
  const hash = CryptoJS.HmacSHA256(payload, serverConfig.webhookSecret);
  const computedSignature = CryptoJS.enc.Hex.stringify(hash);
  return computedSignature === signature;
}

// Process order data
function processOrderData(data) {
  const { attributes } = data;
  return {
    order_id: data.id,
    order_number: attributes.order_number,
    customer_email: attributes.user_email,
    customer_name: attributes.user_name,
    total: attributes.total,
    currency: attributes.currency,
    status: attributes.status,
    test_mode: attributes.test_mode,
    created_at: attributes.created_at,
    product_name: attributes.first_order_item?.product_name || 'Unknown Product',
    variant_name: attributes.first_order_item?.variant_name || 'Default Variant',
    subscription_id: attributes.subscription_id,
    processed: false
  };
}

// Process subscription data
function processSubscriptionData(data) {
  const { attributes } = data;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  
  return {
    id: data.id,
    status: attributes.status,
    renews_at: attributes.renews_at,
    ends_at: attributes.ends_at,
    expires_at: expiryDate.toISOString(),
    created_at: attributes.created_at,
    updated_at: new Date().toISOString(),
    customer_id: attributes.customer_id,
    product_id: attributes.product_id,
    variant_id: attributes.variant_id
  };
}

// Check for expired subscriptions every hour
setInterval(async () => {
  try {
    await handleSubscriptionExpiry();
  } catch (error) {
    console.error('Error checking for expired subscriptions:', error);
  }
}, 60 * 60 * 1000);

// Webhook endpoint
app.post('/api/webhooks/lemonsqueezy', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const payload = req.body.toString();

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(payload);
    const { meta, data } = event;

    // Handle different event types
    switch (meta.event_name) {
      case 'order_created': {
        const orderData = processOrderData(data);
        
        // Only process paid orders
        if (orderData.status === 'paid') {
          const savedOrder = await saveOrder(orderData);
          
          // Emit event for real-time updates
          io.emit('payment_event', {
            type: 'order_created',
            order: savedOrder
          });
        }
        break;
      }

      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled':
      case 'subscription_expired': {
        const subscriptionData = processSubscriptionData(data);
        const updatedSubscription = await updateSubscription(subscriptionData);
        
        if (updatedSubscription) {
          // Emit event for real-time updates
          io.emit('payment_event', {
            type: meta.event_name,
            subscription: updatedSubscription
          });
        }
        break;
      }

      default:
        console.warn('Unhandled event type:', meta.event_name);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
httpServer.listen(serverConfig.port, () => {
  console.log(`Webhook server running on port ${serverConfig.port}`);
});