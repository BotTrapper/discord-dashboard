import { ClockIcon } from "@heroicons/react/24/outline";
import type { AdminActivity } from "../../../types";

interface ActivityTabProps {
  activities: AdminActivity[];
}

export default function ActivityTab({ activities }: ActivityTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Admin-Aktivitäten
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Keine Aktivitäten gefunden.
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.admin_username || activity.admin_user_id}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.action.replace("_", " ").toLowerCase()}
                    </span>
                  </div>
                  {activity.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {activity.details}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(activity.created_at).toLocaleString("de-DE")}
                    </span>
                    {activity.target_type && (
                      <span>Target: {activity.target_type}</span>
                    )}
                    {activity.guild_id && (
                      <span>Guild: {activity.guild_id}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
