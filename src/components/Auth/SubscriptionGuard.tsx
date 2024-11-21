import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { CreditCard, Lock } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { preferences } = useUserStore();
  const location = useLocation();
  const hasActiveSubscription = preferences.subscription?.status === 'active';

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Feature
          </h2>
          <p className="text-gray-600 mb-6">
            Access to Content Ideas requires an active subscription. Upgrade your plan to unlock this feature.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}