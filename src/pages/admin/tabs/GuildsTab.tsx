import { ServerStackIcon } from "@heroicons/react/24/outline";
import { formatDateShort } from "../../../utils/formatters";
import type { GuildInfo } from "../../../types";

interface GuildsTabProps {
  guilds: GuildInfo[];
  onOpenGuildDashboard: (guildId: string) => void;
}

export default function GuildsTab({
  guilds,
  onOpenGuildDashboard,
}: GuildsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Server Verwaltung ({guilds.length} Server)
        </h2>
        <div className="flex space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Sortiert nach Mitgliederanzahl</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guilds.map((guild) => (
          <div
            key={guild.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {guild.icon ? (
                <img
                  src={guild.icon}
                  alt={guild.name}
                  className="h-16 w-16 rounded-xl flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {guild.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                  {guild.name}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {guild.memberCount.toLocaleString()} Mitglieder
                      </span>
                    </div>
                  </div>

                  {guild.features && guild.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {guild.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                        >
                          {feature.replace("_", " ").toLowerCase()}
                        </span>
                      ))}
                      {guild.features.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{guild.features.length - 3} weitere
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                    <div>
                      ID:{" "}
                      <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                        {guild.id}
                      </code>
                    </div>
                    {guild.joinedAt && (
                      <div>Beigetreten: {formatDateShort(guild.joinedAt)}</div>
                    )}
                    <div>Erstellt: {formatDateShort(guild.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <button
                  onClick={() => onOpenGuildDashboard(guild.id)}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  title="Dashboard mit Admin-Berechtigung öffnen"
                >
                  🔑 Admin Dashboard
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(guild.id)}
                  className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Guild ID kopieren"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {guilds.length === 0 && (
        <div className="text-center py-12">
          <ServerStackIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Keine Server gefunden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Der Bot ist derzeit mit keinen Discord-Servern verbunden.
          </p>
        </div>
      )}
    </div>
  );
}
