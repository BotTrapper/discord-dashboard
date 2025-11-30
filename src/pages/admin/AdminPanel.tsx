import { useEffect, useState } from "react";
import { authService } from "../../lib/auth";
import { api } from "../../lib/api";
import {
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";
import type {
  GlobalSetting,
  GlobalAdmin,
  AdminActivity,
  GuildInfo,
} from "../../types";
import OverviewTab from "./tabs/OverviewTab";
import SettingsTab from "./tabs/SettingsTab";
import AdminsTab from "./tabs/AdminsTab";
import GuildsTab from "./tabs/GuildsTab";
import ActivityTab from "./tabs/ActivityTab";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [settings, setSettings] = useState<GlobalSetting[]>([]);
  const [admins, setAdmins] = useState<GlobalAdmin[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [guilds, setGuilds] = useState<GuildInfo[]>([]);

  // Admin session management
  const handleOpenGuildDashboard = async (guildId: string) => {
    try {
      // Generate admin session token
      await api.generateAdminSession(guildId);

      // Open guild dashboard in new tab
      window.open(`/dashboard/${guildId}`, "_blank");
    } catch (err) {
      console.error("Failed to generate admin session:", err);
      alert(
        "Fehler beim Erstellen der Admin-Session. Bitte versuchen Sie es erneut.",
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is admin first
      const adminStatus = await authService.apiRequest("/api/admin/status");
      const adminData = await adminStatus.json();

      if (!adminData.isAdmin) {
        setError("Sie haben keine Admin-Berechtigung für dieses Panel.");
        return;
      }

      // Load all admin data
      const [settingsRes, adminsRes, activitiesRes, guildsRes] =
        await Promise.all([
          authService.apiRequest("/api/admin/settings"),
          authService.apiRequest("/api/admin/admins"),
          authService.apiRequest("/api/admin/activity?limit=20"),
          authService.apiRequest("/api/admin/guilds"),
        ]);

      const [settingsData, adminsData, activitiesData, guildsData] =
        await Promise.all([
          settingsRes.json(),
          adminsRes.json(),
          activitiesRes.json(),
          guildsRes.json(),
        ]);

      setSettings(Array.isArray(settingsData) ? settingsData : []);
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setGuilds(Array.isArray(guildsData) ? guildsData : []);
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError("Fehler beim Laden der Admin-Daten");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (newAdmin: {
    userId: string;
    username: string;
    level: number;
  }) => {
    try {
      if (!newAdmin.userId || !newAdmin.username) {
        setError("Benutzer-ID und Username sind erforderlich");
        return;
      }

      const response = await authService.apiRequest("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });

      if (response.ok) {
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Hinzufügen des Admins");
      }
    } catch (err) {
      console.error("Error adding admin:", err);
      setError("Fehler beim Hinzufügen des Admins");
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      if (!confirm("Admin wirklich entfernen?")) return;

      const response = await authService.apiRequest(
        `/api/admin/admins/${userId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Entfernen des Admins");
      }
    } catch (err) {
      console.error("Error removing admin:", err);
      setError("Fehler beim Entfernen des Admins");
    }
  };

  const addSetting = async (newSetting: {
    key: string;
    value: string;
    type: string;
    description: string;
  }) => {
    try {
      if (!newSetting.key || !newSetting.value) {
        setError("Schlüssel und Wert sind erforderlich");
        return;
      }

      const response = await authService.apiRequest(
        `/api/admin/settings/${encodeURIComponent(newSetting.key)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value: newSetting.value,
            type: newSetting.type,
            description: newSetting.description,
          }),
        },
      );

      if (response.ok) {
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Fehler beim Hinzufügen der Einstellung");
      }
    } catch (err) {
      console.error("Error adding setting:", err);
      setError("Fehler beim Hinzufügen der Einstellung");
    }
  };

  const tabs = [
    { id: "overview", name: "Übersicht", icon: ChartBarIcon },
    { id: "settings", name: "Einstellungen", icon: CogIcon },
    { id: "admins", name: "Admins", icon: UserGroupIcon },
    { id: "guilds", name: "Server", icon: ServerStackIcon },
    { id: "activity", name: "Aktivitäten", icon: ClockIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Control Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Globale Verwaltung des BotTrapper Systems
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Fehler
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <OverviewTab
              guilds={guilds}
              admins={admins}
              settings={settings}
              activities={activities}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab settings={settings} onAddSetting={addSetting} />
          )}

          {activeTab === "admins" && (
            <AdminsTab
              admins={admins}
              onAddAdmin={addAdmin}
              onRemoveAdmin={removeAdmin}
            />
          )}

          {activeTab === "guilds" && (
            <GuildsTab
              guilds={guilds}
              onOpenGuildDashboard={handleOpenGuildDashboard}
            />
          )}

          {activeTab === "activity" && <ActivityTab activities={activities} />}
        </div>
      </div>
    </div>
  );
}
