import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { authService } from "../lib/auth";
import {
  Cog6ToothIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BoltIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface GuildSettings {
  guildId: string;
  enabledFeatures: string[];
  settings: Record<string, any>;
  updatedAt?: string;
}

interface SettingsState {
  loading: boolean;
  saving: boolean;
  error: string | null;
  settings: GuildSettings | null;
}

const FEATURE_INFO = {
  tickets: {
    name: "Ticket System",
    description: "Ermöglicht es Benutzern, Support-Tickets zu erstellen",
    icon: TicketIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  autoresponses: {
    name: "Auto-Responses",
    description: "Automatische Antworten auf bestimmte Nachrichten",
    icon: ChatBubbleLeftRightIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  statistics: {
    name: "Statistiken",
    description: "Sammelt und zeigt Bot-Nutzungsstatistiken",
    icon: ChartBarIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  webhooks: {
    name: "Webhooks",
    description: "Webhook-Benachrichtigungen und Integrationen",
    icon: BoltIcon,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
};

export default function Settings() {
  const { guildId } = useParams<{ guildId: string }>();
  const [state, setState] = useState<SettingsState>({
    loading: true,
    saving: false,
    error: null,
    settings: null,
  });

  const loadSettings = useCallback(async () => {
    if (!guildId) return;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await authService.apiRequest(`/api/settings/${guildId}`);

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const settings = await response.json();
      setState((prev) => ({
        ...prev,
        loading: false,
        settings,
      }));
    } catch (err) {
      console.error("Error loading settings:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Fehler beim Laden der Einstellungen",
      }));
    }
  }, [guildId]);

  const saveFeatureSettings = useCallback(
    async (featureUpdates: Record<string, boolean>) => {
      if (!guildId) return;

      try {
        setState((prev) => ({ ...prev, saving: true, error: null }));

        const response = await authService.apiRequest(
          `/api/settings/${guildId}/features`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              features: featureUpdates,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to save settings");
        }

        const result = await response.json();

        setState((prev) => ({
          ...prev,
          saving: false,
          settings: prev.settings
            ? {
                ...prev.settings,
                enabledFeatures: result.enabledFeatures,
              }
            : null,
        }));

        console.log("Settings saved successfully!");
      } catch (err) {
        console.error("Error saving settings:", err);
        setState((prev) => ({
          ...prev,
          saving: false,
          error: "Fehler beim Speichern der Einstellungen",
        }));
      }
    },
    [guildId],
  );

  const toggleFeature = useCallback(
    async (featureName: string) => {
      if (!state.settings) return;

      const isCurrentlyEnabled =
        state.settings.enabledFeatures.includes(featureName);
      const newEnabledStatus = !isCurrentlyEnabled;

      // Optimistic update
      setState((prev) => ({
        ...prev,
        settings: prev.settings
          ? {
              ...prev.settings,
              enabledFeatures: newEnabledStatus
                ? [...prev.settings.enabledFeatures, featureName]
                : prev.settings.enabledFeatures.filter(
                    (f) => f !== featureName,
                  ),
            }
          : null,
      }));

      // Save to backend
      await saveFeatureSettings({ [featureName]: newEnabledStatus });
    },
    [state.settings, saveFeatureSettings],
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            {state.error}
          </div>
          <button
            onClick={loadSettings}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
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
              Feature-Einstellungen
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Aktiviere oder deaktiviere Bot-Features für diesen Server
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {Object.entries(FEATURE_INFO).map(([featureKey, info]) => {
                const isEnabled =
                  state.settings?.enabledFeatures.includes(featureKey) || false;
                const IconComponent = info.icon;

                return (
                  <div
                    key={featureKey}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${info.bgColor} dark:bg-opacity-20`}
                      >
                        <IconComponent
                          className={`h-6 w-6 ${info.color} dark:text-opacity-80`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {info.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {info.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleFeature(featureKey)}
                        disabled={state.saving}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                          isEnabled
                            ? "bg-indigo-600 dark:bg-indigo-500"
                            : "bg-gray-200 dark:bg-gray-600"
                        } ${state.saving ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="sr-only">
                          {info.name}{" "}
                          {isEnabled ? "deaktivieren" : "aktivieren"}
                        </span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? "translate-x-5" : "translate-x-0"
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

            {/* Save Status */}
            {state.settings?.updatedAt && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <InformationCircleIcon className="h-4 w-4 mr-2" />
                  Zuletzt aktualisiert:{" "}
                  {new Date(state.settings.updatedAt).toLocaleString("de-DE")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Wichtiger Hinweis
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Das Deaktivieren von Features macht die entsprechenden
                  Bot-Commands und Funktionen sofort unverfügbar. Benutzer
                  erhalten eine Fehlermeldung, wenn sie versuchen, deaktivierte
                  Features zu verwenden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
