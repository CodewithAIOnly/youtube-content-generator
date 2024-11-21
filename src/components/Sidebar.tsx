import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  Lightbulb, 
  Calendar, 
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Competitors', icon: Users, href: '/competitors' },
  { name: 'Content Ideas', icon: Lightbulb, href: '/content-ideas' },
  { name: 'Calendar', icon: Calendar, href: '/calendar' },
  { name: 'Trends', icon: TrendingUp, href: '/trends' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-gray-900 text-white">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <Lightbulb className="w-8 h-8 text-indigo-400" />
        <span className="ml-2 text-xl font-bold">ContentPro</span>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg w-full"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}