import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { authService } from "../lib/auth";
import {
  UsersIcon,
  ServerIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface ServerStats {
  // Basic guild info
  guildName: string;
  guildIcon: string;
  guildId: string;
  ownerId: string;

  // Member statistics
  totalMembers: number;
  onlineMembers: number;
  botMembers: number;
  humanMembers: number;

  // Channel statistics
  totalChannels: number;
  textChannels: number;
  voiceChannels: number;
  categories: number;

  // Role statistics
  totalRoles: number;

  // Server info
  verificationLevel: number;
  premiumTier: number;
  premiumSubscriptionCount: number;

  // Creation date
  createdAt: string;
  botJoinedAt?: string;

  // Bot-specific stats
  ticketCount: number;
  autoResponseCount: number;
  openTickets: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  description?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { guildId } = useParams<{ guildId: string }>();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const serverStats = await authService.getDashboardStats(guildId!);
      setStats(serverStats);
    } catch (err) {
      console.error("Error loading server stats:", err);
      setError("Failed to load server statistics");
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    if (guildId) {
      loadStats();
    }
  }, [guildId, loadStats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getVerificationLevelText = (level: number) => {
    const levels = ["None", "Low", "Medium", "High", "Very High"];
    return levels[level] || "Unknown";
  };

  const getPremiumTierText = (tier: number) => {
    const tiers = ["No Boost", "Tier 1", "Tier 2", "Tier 3"];
    return tiers[tier] || "Unknown";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24"
              ></div>
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
          Error Loading Statistics
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadStats}
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
                className="h-12 w-12 rounded-full mr-4"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.guildName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Server Statistics & Overview
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Member Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Member Statistics
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Members"
            value={stats.totalMembers.toLocaleString()}
            icon={UsersIcon}
            color="bg-blue-500"
            description="All server members"
          />
          <StatCard
            title="Online Members"
            value={stats.onlineMembers.toLocaleString()}
            icon={UsersIcon}
            color="bg-green-500"
            description="Currently online"
          />
          <StatCard
            title="Human Members"
            value={stats.humanMembers.toLocaleString()}
            icon={UsersIcon}
            color="bg-purple-500"
            description="Real users"
          />
          <StatCard
            title="Bot Members"
            value={stats.botMembers.toLocaleString()}
            icon={ServerIcon}
            color="bg-orange-500"
            description="Bot accounts"
          />
        </div>
      </div>

      {/* Channel & Structure Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Server Structure
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Channels"
            value={stats.totalChannels.toLocaleString()}
            icon={ChatBubbleLeftRightIcon}
            color="bg-cyan-500"
            description="All channels"
          />
          <StatCard
            title="Text Channels"
            value={stats.textChannels.toLocaleString()}
            icon={ChatBubbleLeftRightIcon}
            color="bg-blue-600"
            description="Text channels"
          />
          <StatCard
            title="Voice Channels"
            value={stats.voiceChannels.toLocaleString()}
            icon={ChatBubbleLeftRightIcon}
            color="bg-green-600"
            description="Voice channels"
          />
          <StatCard
            title="Categories"
            value={stats.categories.toLocaleString()}
            icon={ChatBubbleLeftRightIcon}
            color="bg-indigo-600"
            description="Channel categories"
          />
        </div>
      </div>

      {/* Bot Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Bot Statistics
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Tickets"
            value={stats.ticketCount.toLocaleString()}
            icon={ShieldCheckIcon}
            color="bg-blue-500"
            description="All time tickets"
          />
          <StatCard
            title="Open Tickets"
            value={stats.openTickets.toLocaleString()}
            icon={ShieldCheckIcon}
            color="bg-yellow-500"
            description="Currently open"
          />
          <StatCard
            title="Auto Responses"
            value={stats.autoResponseCount.toLocaleString()}
            icon={ChatBubbleLeftRightIcon}
            color="bg-purple-500"
            description="Configured responses"
          />
        </div>
      </div>

      {/* Server Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Server Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Server ID:
              </span>
              <span className="text-gray-900 dark:text-white font-mono text-sm">
                {stats.guildId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Total Roles:
              </span>
              <span className="text-gray-900 dark:text-white">
                {stats.totalRoles}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Verification Level:
              </span>
              <span className="text-gray-900 dark:text-white">
                {getVerificationLevelText(stats.verificationLevel)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Boost Level:
              </span>
              <span className="text-gray-900 dark:text-white">
                {getPremiumTierText(stats.premiumTier)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Boost Count:
              </span>
              <span className="text-gray-900 dark:text-white">
                {stats.premiumSubscriptionCount}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Important Dates
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Server Created
                </span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {formatDate(stats.createdAt)}
              </p>
            </div>
            {stats.botJoinedAt && (
              <div>
                <div className="flex items-center mb-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Bot Joined
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(stats.botJoinedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
