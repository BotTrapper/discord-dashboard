import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authService, type DashboardStats } from '../lib/auth';
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { guildId } = useParams<{ guildId: string }>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guildId) {
      loadDashboardData();
    }
  }, [guildId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats] = await Promise.all([
        authService.getDashboardStats(guildId!),
      ]);

      setStats(dashboardStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <ChartBarIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center mb-2">
            {stats.guildIcon && (
              <img
                src={stats.guildIcon}
                alt={stats.guildName}
                className="h-8 w-8 rounded-full mr-3"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.guildName}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard Overview
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <ClockIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={stats.memberCount.toLocaleString()}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Tickets"
          value={stats.ticketCount}
          icon={TicketIcon}
          color="bg-green-500"
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={TicketIcon}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Auto Responses"
          value={stats.autoResponseCount}
          icon={ChatBubbleLeftRightIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <TicketIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
              <span className="text-gray-900 dark:text-white">Manage Open Tickets</span>
            </button>
            <button className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-gray-900 dark:text-white">Add Auto Response</span>
            </button>
            <button className="w-full flex items-center p-3 text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChartBarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-gray-900 dark:text-white">View Statistics</span>
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Bot Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Bot Status</span>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">API Status</span>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
}
