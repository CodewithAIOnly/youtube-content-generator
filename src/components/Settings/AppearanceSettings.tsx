import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 border-2 rounded-lg flex flex-col items-center space-y-2 hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Sun className="w-6 h-6 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Light</span>
          </button>

          <button className="p-4 border-2 border-indigo-600 bg-indigo-50 rounded-lg flex flex-col items-center space-y-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Moon className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-medium text-gray-900">Dark</span>
          </button>

          <button className="p-4 border-2 rounded-lg flex flex-col items-center space-y-2 hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <Monitor className="w-6 h-6 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">System</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Font Size
            </label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color Scheme
            </label>
            <div className="mt-2 grid grid-cols-6 gap-3">
              {['indigo', 'purple', 'blue', 'green', 'red', 'orange'].map((color) => (
                <button
                  key={color}
                  className={`w-full aspect-square rounded-full bg-${color}-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500`}
                  aria-label={`${color} theme`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}