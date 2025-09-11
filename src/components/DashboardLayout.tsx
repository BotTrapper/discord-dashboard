import { Outlet, useLocation, Link, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../lib/auth';
import {
  HomeIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '', icon: HomeIcon },
  { name: 'Tickets', href: 'tickets', icon: TicketIcon },
  { name: 'Auto Responses', href: 'autoresponses', icon: ChatBubbleLeftRightIcon },
  { name: 'Statistics', href: 'statistics', icon: ChartBarIcon },
  { name: 'Settings', href: 'settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const { guildId } = useParams();
  const user = authService.getUser();

  const currentPath = location.pathname.split('/').pop() || '';

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BT</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                BotTrapper
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  to={`/dashboard/${guildId}/${item.href}`}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and controls */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {isDark ? (
                <SunIcon className="mr-3 h-5 w-5" />
              ) : (
                <MoonIcon className="mr-3 h-5 w-5" />
              )}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            {/* User Profile */}
            <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <img
                className="h-8 w-8 rounded-full"
                src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`}
                alt={user?.username}
              />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  #{user?.discriminator}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
