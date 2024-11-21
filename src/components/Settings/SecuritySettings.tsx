import React, { useState } from 'react';
import { Shield, Key, Smartphone, Globe, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SecuritySettings() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'San Francisco, US',
      lastActive: 'Active now',
      current: true,
    },
    {
      id: '2',
      device: 'Firefox on MacOS',
      location: 'New York, US',
      lastActive: '2 hours ago',
      current: false,
    },
    {
      id: '3',
      device: 'Safari on iPhone',
      location: 'London, UK',
      lastActive: '1 day ago',
      current: false,
    },
  ]);

  const handleEndSession = (sessionId: string) => {
    // In a real app, this would make an API call to end the session
    console.log('Ending session:', sessionId);
  };

  const handleEndAllSessions = () => {
    // In a real app, this would make an API call to end all sessions except current
    console.log('Ending all other sessions');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-500">
                Update your password regularly to keep your account secure
              </p>
            </div>
          </div>
          <button className="btn-secondary">
            Update
          </button>
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Active Sessions</p>
              <p className="text-sm text-gray-500">
                Manage your active sessions across devices
              </p>
            </div>
          </div>
          <button 
            onClick={handleEndAllSessions}
            className="text-sm text-red-600 hover:text-red-700"
          >
            End All Other Sessions
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border-b last:border-b-0"
            >
              <div className="flex items-start space-x-4">
                <Globe className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        (Current)
                      </span>
                    )}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      {session.location}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {session.lastActive}
                    </span>
                  </div>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleEndSession(session.id)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  End Session
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout from all devices
        </button>
      </div>
    </div>
  );
}