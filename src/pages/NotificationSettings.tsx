import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { NotificationSettings as NotificationSettingsType } from "../types";

interface NotificationEventConfig {
  type: string;
  label: string;
  description: string;
}

const NOTIFICATION_EVENTS: NotificationEventConfig[] = [
  {
    type: "ticket_created",
    label: "Ticket erstellt",
    description: "Benachrichtigung wenn ein neues Ticket erstellt wird",
  },
  {
    type: "ticket_closed",
    label: "Ticket geschlossen",
    description: "Benachrichtigung wenn ein Ticket geschlossen wird",
  },
  {
    type: "member_join",
    label: "Mitglied beigetreten",
    description: "Benachrichtigung wenn ein neues Mitglied dem Server beitritt",
  },
  {
    type: "member_leave",
    label: "Mitglied verlassen",
    description: "Benachrichtigung wenn ein Mitglied den Server verlässt",
  },
  {
    type: "autoresponse_triggered",
    label: "Auto-Response ausgelöst",
    description: "Benachrichtigung wenn eine Auto-Response ausgelöst wird",
  },
];

export default function NotificationSettings() {
  const { guildId } = useParams<{ guildId: string }>();
  const [settings, setSettings] = useState<NotificationSettingsType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!guildId) return;

    try {
      setLoading(true);
      setError(null);
      setApiUnavailable(false);
      const response = await api.get<NotificationSettingsType>(
        `/api/notifications/${guildId}/settings`,
      );
      setSettings(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";

      // Check if API/Bot is unavailable
      if (
        errorMessage.includes("Network Error") ||
        errorMessage.includes("404") ||
        errorMessage.includes("503")
      ) {
        setApiUnavailable(true);
        setError(
          "Die Benachrichtigungs-API ist derzeit nicht erreichbar. Der Bot ist möglicherweise offline.",
        );
      } else {
        setError("Fehler beim Laden der Benachrichtigungseinstellungen");
      }

      // Set default settings for UI skeleton
      setSettings({
        guildId: guildId,
        enabled: false,
        channelId: null,
        events: NOTIFICATION_EVENTS.map((e) => ({
          type: e.type,
          enabled: false,
          customMessage: null,
        })),
        webhookUrl: null,
        mentionRoles: [],
        mentionUsers: [],
      });
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async () => {
    if (!guildId || !settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.put(`/api/notifications/${guildId}/settings`, settings);

      setSuccess("Einstellungen erfolgreich gespeichert");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(`Fehler beim Speichern: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!guildId) return;

    try {
      setTesting(true);
      setError(null);
      setSuccess(null);

      await api.post(`/api/notifications/${guildId}/test`);

      setSuccess("Test-Benachrichtigung erfolgreich gesendet");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(`Fehler beim Senden der Test-Benachrichtigung: ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  };

  const handleToggleEnabled = () => {
    if (settings) {
      setSettings({ ...settings, enabled: !settings.enabled });
    }
  };

  const handleToggleEvent = (eventType: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      events: settings.events.map((event) =>
        event.type === eventType
          ? { ...event, enabled: !event.enabled }
          : event,
      ),
    });
  };

  const handleChannelChange = (channelId: string) => {
    if (settings) {
      setSettings({
        ...settings,
        channelId: channelId.trim() === "" ? null : channelId,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-xl h-20"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BellIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
            Benachrichtigungen
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Konfiguriere Benachrichtigungen für Server-Events
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSettings}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
            title="Einstellungen neu laden"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleTestNotification}
            disabled={testing || apiUnavailable || !settings?.enabled}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {testing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Sende...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Test senden</span>
                <span className="sm:hidden">Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* API Unavailable Warning */}
      {apiUnavailable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                API nicht erreichbar
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Die Benachrichtigungs-API ist derzeit nicht verfügbar. Sie
                können die Einstellungen anzeigen, aber keine Änderungen
                speichern.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !apiUnavailable && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="ml-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="ml-3 text-sm text-green-800 dark:text-green-200">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Enable/Disable Toggle */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellAlertIcon
                className={`h-6 w-6 mr-3 ${settings?.enabled ? "text-green-500" : "text-gray-400"}`}
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Benachrichtigungen aktivieren
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {settings?.enabled
                    ? "Benachrichtigungen sind aktiv"
                    : "Benachrichtigungen sind deaktiviert"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleEnabled}
              disabled={apiUnavailable}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                settings?.enabled
                  ? "bg-indigo-600"
                  : "bg-gray-200 dark:bg-gray-600"
              }`}
              role="switch"
              aria-checked={settings?.enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings?.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Channel Selection */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Benachrichtigungs-Kanal
          </label>
          <input
            type="text"
            value={settings?.channelId || ""}
            onChange={(e) => handleChannelChange(e.target.value)}
            placeholder="Kanal-ID eingeben (z.B. 123456789012345678)"
            disabled={apiUnavailable || !settings?.enabled}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Die ID des Discord-Kanals, in dem Benachrichtigungen gesendet werden
            sollen
          </p>
        </div>

        {/* Event Configuration */}
        <div className="p-4 sm:p-6">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Event-Benachrichtigungen
          </h3>
          <div className="space-y-3">
            {NOTIFICATION_EVENTS.map((eventConfig) => {
              const eventSetting = settings?.events.find(
                (e) => e.type === eventConfig.type,
              );
              const isEnabled = eventSetting?.enabled || false;

              return (
                <div
                  key={eventConfig.type}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isEnabled
                      ? "bg-indigo-50 dark:bg-indigo-900/20"
                      : "bg-gray-50 dark:bg-gray-700/50"
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {eventConfig.label}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {eventConfig.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleEvent(eventConfig.type)}
                    disabled={apiUnavailable || !settings?.enabled}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isEnabled
                        ? "bg-indigo-600"
                        : "bg-gray-300 dark:bg-gray-500"
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving || apiUnavailable}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Einstellungen speichern
            </>
          )}
        </button>
      </div>
    </div>
  );
}
