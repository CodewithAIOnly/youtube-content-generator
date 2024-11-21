import React from 'react';
import { Package, Calendar, AlertTriangle } from 'lucide-react';
import type { Subscription } from '../../types';

interface SubscriptionCardProps {
  subscription?: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isActive = subscription?.status === 'active';
  const renewalDate = subscription?.renewalDate 
    ? new Date(subscription.renewalDate)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {subscription?.plan || 'Free Plan'}
            </h3>
          </div>
          
          <div className="mt-2 flex items-center">
            {isActive ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {subscription?.status || 'Inactive'}
              </span>
            )}
          </div>
        </div>
      </div>

      {renewalDate && (
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          {isActive ? 'Renews' : 'Expires'} on {renewalDate.toLocaleDateString()}
        </div>
      )}

      {renewalDate && (
  <div className="mt-4 flex items-center text-sm text-gray-500">
    <Calendar className="w-4 h-4 mr-2" />
    {isActive ? 'Expires' : 'Expires'} on {
      (() => {
        const nextDate = new Date(renewalDate); // Create a new Date object
        nextDate.setMonth(nextDate.getMonth() + 1); // Add one month
        return nextDate.toLocaleDateString(); // Format the new date
      })()
    }
  </div>
)}



      {subscription?.status === 'canceled' && (
        <div className="mt-4 flex items-start bg-yellow-50 p-4 rounded-md">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
          <div className="flex-1 text-sm text-yellow-700">
            Your subscription will remain active until the end of the billing period. 
            After that, you'll be switched to the free plan.
          </div>
        </div>
      )}
    </div>
  );
}