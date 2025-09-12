import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type Guild } from '../lib/auth';
import {
  ServerIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function GuildSelection() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadGuilds();
    checkAdminStatus();
  }, []);

  const loadGuilds = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setGuilds(user.guilds);
      } else {
        setError('Failed to load user data');
      }
    } catch (err) {
      setError('Failed to load guilds');
      console.error('Error loading guilds:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await authService.apiRequest('/api/admin/status');
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (err) {
      console.log('Not an admin or error checking status:', err);
      setIsAdmin(false);
    }
  };

  const selectGuild = (guildId: string) => {
    navigate(`/dashboard/${guildId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadGuilds}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">BT</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to BotTrapper Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select a server to manage your bot settings
          </p>
        </div>

        {/* Admin Panel Access */}
        {isAdmin && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-white mr-3" />
                <h2 className="text-xl font-bold text-white">Global Administrator</h2>
              </div>
              <p className="text-red-100 mb-4">
                Sie haben globale Admin-Berechtigung und können das Admin Control Panel verwenden.
              </p>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors shadow-lg"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Admin Control Panel öffnen
              </button>
            </div>
          </div>
        )}

        {guilds.length === 0 ? (
          <div className="text-center">
            <ServerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Available Servers
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have manage permissions on any servers where BotTrapper is installed.
            </p>
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=8&scope=bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Invite Bot to Server
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guilds.map((guild) => (
              <button
                key={guild.id}
                onClick={() => selectGuild(guild.id)}
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-left transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {guild.icon ? (
                      <img
                        className="h-12 w-12 rounded-full"
                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                        alt={guild.name}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <ServerIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {guild.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Server ID: {guild.id}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
