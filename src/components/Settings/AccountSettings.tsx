import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Pencil, Check, X } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';

export function AccountSettings() {
  const { preferences, updateProfile } = useUserStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.username || '',
    email: user?.email || '',
    timezone: preferences.profile.timezone,
    avatar: preferences.profile.avatar,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.username,
        email: user.email,
      }));
    }
  }, [user]);

  const handleEdit = () => {
    setFormData({
      displayName: user?.username || preferences.profile.displayName,
      email: user?.email || preferences.profile.email,
      timezone: preferences.profile.timezone,
      avatar: preferences.profile.avatar,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.username || preferences.profile.displayName,
      email: user?.email || preferences.profile.email,
      timezone: preferences.profile.timezone,
      avatar: preferences.profile.avatar,
    });
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    updateProfile({
      ...formData,
      avatar: avatarPreview || formData.avatar,
    });
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center text-sm text-green-600 hover:text-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center text-sm text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarPreview || formData.avatar ? (
              <img
                src={avatarPreview || formData.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          {isEditing && (
            <div>
              <label className="btn-secondary cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                Change Avatar
              </label>
              <p className="mt-2 text-sm text-gray-500">
                JPG, GIF or PNG. Max size 2MB
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-900">{formData.displayName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : (
                <p className="flex-1 px-3 py-2 text-gray-900">
                  {formData.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time Zone
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                <Globe className="w-4 h-4" />
              </span>
              {isEditing ? (
                <select
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option>(GMT-08:00) Pacific Time</option>
                  <option>(GMT-05:00) Eastern Time</option>
                  <option>(GMT+00:00) UTC</option>
                  <option>(GMT+01:00) Central European Time</option>
                </select>
              ) : (
                <p className="flex-1 px-3 py-2 text-gray-900">
                  {formData.timezone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}