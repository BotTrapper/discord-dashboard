import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import {
  Cog6ToothIcon,
  InformationCircleIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Feature {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
}

interface NotificationSettings {
  notificationCategoryId: string | null;
  infoChannelId: string | null;
  notificationRoles: string[];
  notificationsEnabled: boolean;
  lastNotificationVersion: string | null;
  setupCompleted: boolean;
}

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

interface SettingsState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  features: Feature[];
  notifications: NotificationSettings | null;
  roles: Role[];
  testingNotification: boolean;
}

const FEATURE_ICONS = {
  tickets: TicketIcon,
  autoresponses: ChatBubbleLeftRightIcon,
  statistics: ChartBarIcon,
  autoroles: UserGroupIcon,
};

const FEATURE_COLORS = {
  tickets: "text-blue-600 dark:text-blue-400",
  autoresponses: "text-green-600 dark:text-green-400", 
  statistics: "text-purple-600 dark:text-purple-400",
  autoroles: "text-orange-600 dark:text-orange-400",
};

const FEATURE_BG_COLORS = {
  tickets: "bg-blue-50 dark:bg-blue-900/20",
  autoresponses: "bg-green-50 dark:bg-green-900/20",
  statistics: "bg-purple-50 dark:bg-purple-900/20", 
  autoroles: "bg-orange-50 dark:bg-orange-900/20",
};

export default function Settings() {
  const { guildId } = useParams<{ guildId: string }>();
  const [state, setState] = useState<SettingsState>({
    loading: true,
    saving: false,
    error: null,
    features: [],
    notifications: null,
    roles: [],
    testingNotification: false,
  });

  const loadSettings = useCallback(async () => {
    if (!guildId) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Load features, notification settings, and roles in parallel
      const [featuresResponse, notificationResponse, rolesResponse] = await Promise.all([
        api.get(`/api/guilds/${guildId}/features`),
        api.get(`/api/notifications/${guildId}/settings`),
        api.get(`/api/discord/${guildId}/roles`),
      ]);

      setState(prev => ({
        ...prev,
        loading: false,
        features: featuresResponse.data || [],
        notifications: notificationResponse.data || null,
        roles: rolesResponse.data.roles?.filter((role: Role) => 
          role.id !== guildId && !role.managed
        ) || [],
      }));
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.response?.data?.error || 'Fehler beim Laden der Einstellungen',
      }));
    }
  }, [guildId]);

  const updateNotificationSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!guildId) return;

    try {
      setState(prev => ({ ...prev, testingNotification: true }));
      
      const response = await api.put(`/api/notifications/${guildId}/settings`, updates);
      
      setState(prev => ({
        ...prev,
        notifications: response.data,
        testingNotification: false,
      }));
    } catch (err: any) {
      console.error('Failed to update notification settings:', err);
      setState(prev => ({
        ...prev,
        testingNotification: false,
        error: err.response?.data?.error || 'Fehler beim Aktualisieren der Notification-Einstellungen',
      }));
    }
  }, [guildId]);

  const sendTestNotification = useCallback(async () => {
    if (!guildId) return;

    try {
      setState(prev => ({ ...prev, testingNotification: true }));
      
      await api.post(`/api/notifications/${guildId}/test`);
      
      // Success feedback - could add a toast/notification here
      setState(prev => ({ ...prev, testingNotification: false }));
    } catch (err: any) {
      console.error('Failed to send test notification:', err);
      setState(prev => ({
        ...prev,
        testingNotification: false,
        error: err.response?.data?.error || 'Fehler beim Senden der Test-Notification',
      }));
    }
  }, [guildId]);

  const toggleFeature = useCallback(
    async (featureName: string, enabled: boolean) => {
      if (!guildId) return;

      try {
        setState((prev) => ({ ...prev, saving: true, error: null }));

        await api.put(`/api/guilds/${guildId}/features/${featureName}`, {
          enabled
        });

        // Update local state
        setState((prev) => ({
          ...prev,
          saving: false,
          features: prev.features.map(f => 
            f.name === featureName ? { ...f, enabled } : f
          )
        }));

        console.log(`✅ Feature ${featureName} ${enabled ? 'aktiviert' : 'deaktiviert'}`);
      } catch (err) {
        console.error("Error toggling feature:", err);
        setState((prev) => ({
          ...prev,
          saving: false,
          error: "Fehler beim Aktualisieren der Einstellung",
        }));
        // Revert local state on error
        setState((prev) => ({
          ...prev,
          features: prev.features.map(f => 
            f.name === featureName ? { ...f, enabled: !enabled } : f
          )
        }));
      }
    },
    [guildId],
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
            {state.error}
          </div>
          <button
            onClick={loadSettings}
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Server Einstellungen
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Verwalte die Bot-Features für diesen Server
              </p>
            </div>
          </div>
        </div>

        {/* Feature Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              🔧 Bot Features
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Aktiviere oder deaktiviere verschiedene Bot-Funktionen für diesen Server
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {state.features.map((feature) => {
                const IconComponent = FEATURE_ICONS[feature.name as keyof typeof FEATURE_ICONS];
                const colorClass = FEATURE_COLORS[feature.name as keyof typeof FEATURE_COLORS] || "text-gray-600 dark:text-gray-400";
                const bgColorClass = FEATURE_BG_COLORS[feature.name as keyof typeof FEATURE_BG_COLORS] || "bg-gray-50 dark:bg-gray-700";

                return (
                  <div
                    key={feature.name}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${bgColorClass}`}>
                        {IconComponent && (
                          <IconComponent
                            className={`h-6 w-6 ${colorClass}`}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.displayName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        feature.enabled
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {feature.enabled ? 'Aktiviert' : 'Deaktiviert'}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleFeature(feature.name, !feature.enabled)}
                        disabled={state.saving}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                          feature.enabled
                            ? "bg-indigo-600 dark:bg-indigo-500"
                            : "bg-gray-200 dark:bg-gray-600"
                        } ${state.saving ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="sr-only">
                          {feature.displayName}{" "}
                          {feature.enabled ? "deaktivieren" : "aktivieren"}
                        </span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                            feature.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>

                      {state.saving && (
                        <div className="ml-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              🔔 Notification System
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Konfiguriere automatische Version-Benachrichtigungen für Updates
            </p>
          </div>

          <div className="p-6 space-y-6">
            {state.notifications?.setupCompleted ? (
              <>
                {/* Channel Status */}
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                      <svg className="h-5 w-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                        Notification System aktiv
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Kategorie und Info-Channel wurden erstellt
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={sendTestNotification}
                    disabled={state.testingNotification}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
                  >
                    {state.testingNotification ? 'Sende...' : 'Test senden'}
                  </button>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Benachrichtigte Rollen
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3">
                    {state.roles.map((role) => (
                      <label key={role.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                        <input
                          type="checkbox"
                          checked={state.notifications?.notificationRoles?.includes(role.id) || false}
                          onChange={(e) => {
                            const currentRoles = state.notifications?.notificationRoles || [];
                            const updatedRoles = e.target.checked
                              ? [...currentRoles, role.id]
                              : currentRoles.filter((id: string) => id !== role.id);
                            
                            updateNotificationSettings({ notificationRoles: updatedRoles });
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `#${role.color.toString(16).padStart(6, '0')}` }}
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Enabled Toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Benachrichtigungen aktiviert
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatische Benachrichtigungen bei neuen Bot-Versionen
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationSettings({ 
                      notificationsEnabled: !state.notifications?.notificationsEnabled 
                    })}
                    disabled={state.testingNotification}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      state.notifications?.notificationsEnabled
                        ? "bg-indigo-600 dark:bg-indigo-500"
                        : "bg-gray-200 dark:bg-gray-600"
                    } ${state.testingNotification ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="sr-only">Benachrichtigungen umschalten</span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                        state.notifications?.notificationsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </>
            ) : (
              /* Setup Required */
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Notification System Setup erforderlich
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Das Bot-Notification System ist noch nicht eingerichtet. 
                  <br /><br />
                  <strong>Setup-Anleitung:</strong>
                  <br />1. Gehe zu Discord
                  <br />2. Verwende den Slash Command: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">/bottrapper setup</code>
                  <br />3. Wähle einen Text-Channel für Info-Nachrichten
                </p>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Hinweis:</strong> Nur der Server-Owner kann das Setup durchführen.
                    <br />Du kannst die Channel-Berechtigungen selbst verwalten.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 dark:text-blue-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Wichtige Hinweise
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Slash Commands werden automatisch basierend auf aktivierten Features registriert</li>
                  <li>Das Deaktivieren von Features entfernt die entsprechenden Commands aus Discord</li>
                  <li>Änderungen werden sofort wirksam und erfordern keinen Bot-Neustart</li>
                  <li>Deaktivierte Features sind für Server-Mitglieder nicht sichtbar oder nutzbar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
