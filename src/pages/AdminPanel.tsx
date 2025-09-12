import { useEffect, useState } from "react";
import { authService } from "../lib/auth";
import {
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";

interface GlobalSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  updated_by: string;
  updated_at: string;
}

interface GlobalAdmin {
  id: number;
  user_id: string;
  username: string;
  level: number;
  granted_by: string;
  granted_at: string;
  is_active: boolean;
}

interface AdminActivity {
  id: number;
  admin_user_id: string;
  admin_username: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  guild_id: string;
  created_at: string;
}

interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  ownerID: string | null;
  features: string[];
  createdAt: string;
  joinedAt: string | null;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [settings, setSettings] = useState<GlobalSetting[]>([]);
  const [admins, setAdmins] = useState<GlobalAdmin[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [guilds, setGuilds] = useState<GuildInfo[]>([]);

  // Form states
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddSetting, setShowAddSetting] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    userId: "",
    username: "",
    level: 1,
  });
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    type: "string",
    description: "",
  });

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

  const addAdmin = async () => {
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
        setNewAdmin({ userId: "", username: "", level: 1 });
        setShowAddAdmin(false);
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

  const addSetting = async () => {
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
        setNewSetting({ key: "", value: "", type: "string", description: "" });
        setShowAddSetting(false);
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
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
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Globale Einstellungen
                </h2>
                <button
                  onClick={() => setShowAddSetting(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Einstellung hinzufügen</span>
                </button>
              </div>

              {showAddSetting && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Neue Einstellung
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Schlüssel
                      </label>
                      <input
                        type="text"
                        value={newSetting.key}
                        onChange={(e) =>
                          setNewSetting({ ...newSetting, key: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. maintenance_mode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Wert
                      </label>
                      <input
                        type="text"
                        value={newSetting.value}
                        onChange={(e) =>
                          setNewSetting({
                            ...newSetting,
                            value: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. false"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Typ
                      </label>
                      <select
                        value={newSetting.type}
                        onChange={(e) =>
                          setNewSetting({ ...newSetting, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="string">String</option>
                        <option value="boolean">Boolean</option>
                        <option value="number">Number</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Beschreibung
                      </label>
                      <input
                        type="text"
                        value={newSetting.description}
                        onChange={(e) =>
                          setNewSetting({
                            ...newSetting,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Beschreibung der Einstellung"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={addSetting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Hinzufügen
                    </button>
                    <button
                      onClick={() => setShowAddSetting(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Schlüssel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Wert
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Typ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Beschreibung
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Aktualisiert
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {settings.map((setting) => (
                        <tr key={setting.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {setting.setting_key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {setting.setting_value}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {setting.setting_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {setting.description || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(setting.updated_at).toLocaleDateString(
                              "de-DE",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === "admins" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Globale Administratoren
                </h2>
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Admin hinzufügen</span>
                </button>
              </div>

              {showAddAdmin && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Neuen Admin hinzufügen
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Benutzer-ID
                      </label>
                      <input
                        type="text"
                        value={newAdmin.userId}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, userId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Discord User ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={newAdmin.username}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level
                      </label>
                      <select
                        value={newAdmin.level}
                        onChange={(e) =>
                          setNewAdmin({
                            ...newAdmin,
                            level: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={1}>Level 1 - Standard Admin</option>
                        <option value={2}>Level 2 - Senior Admin</option>
                        <option value={3}>Level 3 - Super Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={addAdmin}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Hinzufügen
                    </button>
                    <button
                      onClick={() => setShowAddAdmin(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Administrator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Erteilt von
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Erteilt am
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <ShieldCheckIcon className="h-5 w-5 text-indigo-500 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {admin.username}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {admin.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                admin.level === 3
                                  ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                  : admin.level === 2
                                    ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              }`}
                            >
                              Level {admin.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {admin.granted_by || "System"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(admin.granted_at).toLocaleDateString(
                              "de-DE",
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <button
                              onClick={() => removeAdmin(admin.user_id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Admin entfernen"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Guilds Tab */}
          {activeTab === "guilds" && (
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
                              <div>
                                Beigetreten:{" "}
                                {new Date(guild.joinedAt).toLocaleDateString(
                                  "de-DE",
                                )}
                              </div>
                            )}
                            <div>
                              Erstellt:{" "}
                              {new Date(guild.createdAt).toLocaleDateString(
                                "de-DE",
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            window.open(`/dashboard/${guild.id}`, "_blank")
                          }
                          className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Dashboard öffnen
                        </button>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(guild.id)
                          }
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
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
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
                              {activity.admin_username ||
                                activity.admin_user_id}
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
                              {new Date(activity.created_at).toLocaleString(
                                "de-DE",
                              )}
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
          )}
        </div>
      </div>
    </div>
  );
}
