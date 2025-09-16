import { Outlet, useLocation, Link, useParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { authService } from "../lib/auth";
import { useState } from "react";
import Footer from "./Footer";
import {
  HomeIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  KeyIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "", icon: HomeIcon },
  { name: "Tickets", href: "tickets", icon: TicketIcon },
  { name: "Ticket Kategorien", href: "ticket-categories", icon: RectangleGroupIcon },
  {
    name: "Auto Responses",
    href: "autoresponses",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "Statistics", href: "statistics", icon: ChartBarIcon },
  { name: "Berechtigungen", href: "permissions", icon: KeyIcon },
  { name: "Changelog", href: "changelog", icon: DocumentTextIcon },
  { name: "Einstellungen", href: "settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const { guildId } = useParams();
  const user = authService.getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPath = location.pathname.split("/").pop() || "";

  const handleLogout = () => {
    authService.logout(true); // Explicitly call backend logout
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-16 sm:w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-12 sm:h-16 shrink-0 items-center justify-center sm:justify-start px-2 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                <img
                  src={"/logo.png"}
                  alt={"Logo"}
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg"
                />
              </div>
              <span className="hidden sm:block ml-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                BotTrapper
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute right-2 top-2 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-2 sm:py-4 space-y-1 sm:space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  to={`/dashboard/${guildId}/${item.href}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                  title={item.name}
                >
                  <item.icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    } sm:mr-3`}
                  />
                  <span className="hidden sm:block">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and controls */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 space-y-2 sm:space-y-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? (
                <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3" />
              ) : (
                <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3" />
              )}
              <span className="hidden sm:block">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center justify-center sm:justify-start p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <img
                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`}
                alt={user?.username}
              />
              <div className="hidden sm:block ml-3 flex-1 min-w-0">
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
              className="w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-3" />
              <span className="hidden sm:block">Logout</span>
            </button>

            {/* Footer in Sidebar */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-4 mt-2 sm:mt-4">
              <Footer />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-2 left-2 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pl-0">
        <main className="py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 pt-16 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
