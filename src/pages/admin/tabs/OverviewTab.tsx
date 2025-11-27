import {
  ServerStackIcon,
  UserGroupIcon,
  CogIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type {
  GlobalSetting,
  GlobalAdmin,
  AdminActivity,
  GuildInfo,
} from "../../../types";

interface OverviewTabProps {
  guilds: GuildInfo[];
  admins: GlobalAdmin[];
  settings: GlobalSetting[];
  activities: AdminActivity[];
}

export default function OverviewTab({
  guilds,
  admins,
  settings,
  activities,
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ServerStackIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Server
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {guilds.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Admins
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {admins.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CogIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Einstellungen
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {settings.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <ClockIcon className="h-8 w-8 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Letzte Aktivitäten
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {activities.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
