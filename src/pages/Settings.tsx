import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { AccountSettings } from '../components/Settings/AccountSettings';
import { NotificationSettings } from '../components/Settings/NotificationSettings';
import { SecuritySettings } from '../components/Settings/SecuritySettings';
import { BillingSettings } from '../components/Settings/BillingSettings';
import { User, Bell, Shield, CreditCard } from 'lucide-react';

const tabs = [
  { id: 'account', name: 'Account', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'billing', name: 'Billing', icon: CreditCard },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-4 text-center border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300 focus:outline-none ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="space-y-8">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'billing' && <BillingSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}