import React, { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";

interface AutoRole {
  id: number;
  guild_id: string;
  role_id: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
  assignable?: boolean;
}

interface BotInfo {
  hasManageRoles: boolean;
  highestRolePosition: number;
  highestRoleName: string;
}

// interface RolesResponse {
//   roles: Role[];
//   botInfo: BotInfo | null;
// }

const AutoRoles: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const [autoRoles, setAutoRoles] = useState<AutoRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [autoRolesData, rolesData] = await Promise.all([
        api.get(`/api/autoroles/${guildId}`),
        api.get(
          `/api/discord/${guildId}/roles?assignableOnly=${!showAllRoles}`,
        ),
      ]);

      setAutoRoles(autoRolesData.data);

      if (rolesData.data.roles) {
        setRoles(rolesData.data.roles);
        setBotInfo(rolesData.data.botInfo);
      } else {
        // Fallback for old API format
        setRoles(rolesData.data);
        setBotInfo(null);
      }
      setError(null);
    } catch (error: any) {
      console.error("Failed to fetch auto roles:", error);
      setError(error.response?.data?.error || "Failed to load auto roles");
    } finally {
      setLoading(false);
    }
  }, [guildId, showAllRoles]);

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [fetchData]);

  const handleAddAutoRole = async () => {
    const selectedRole = roles.find((r) => r.id === selectedRoleId);
    if (!selectedRole || !guildId) return;

    try {
      setIsAddingRole(true);
      await api.post(`/api/autoroles/${guildId}`, {
        roleId: selectedRole.id,
        roleName: selectedRole.name,
      });

      setSelectedRoleId("");
      await fetchData();
    } catch (error: any) {
      console.error("Failed to add auto role:", error);
      setError(error.response?.data?.error || "Failed to add auto role");
    } finally {
      setIsAddingRole(false);
    }
  };

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    if (!guildId) return;

    try {
      await api.put(`/api/autoroles/${guildId}/${roleId}`, { isActive });
      await fetchData();
    } catch (error: any) {
      console.error("Failed to toggle auto role:", error);
      setError(error.response?.data?.error || "Failed to update auto role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!guildId || !confirm("Möchtest du diese Auto-Role wirklich entfernen?"))
      return;

    try {
      await api.delete(`/api/autoroles/${guildId}/${roleId}`);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete auto role:", error);
      setError(error.response?.data?.error || "Failed to delete auto role");
    }
  };

  // Filter out roles that are already auto roles or cannot be managed
  const availableRoles = roles.filter(
    (role) =>
      !autoRoles.some((autoRole) => autoRole.role_id === role.id) &&
      !role.managed &&
      role.id !== guildId, // Exclude @everyone role
  );

  if (!guildId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Auto-Roles
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Verwalte automatische Rollenzuweisung für neue Server-Mitglieder
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bot Hierarchy Info */}
        {botInfo && (
          <div
            className={`rounded-lg p-4 mb-6 ${
              botInfo.hasManageRoles
                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <span
                  className={`text-xl ${
                    botInfo.hasManageRoles ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  {botInfo.hasManageRoles ? "🤖" : "⚠️"}
                </span>
              </div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    botInfo.hasManageRoles
                      ? "text-blue-800 dark:text-blue-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {botInfo.hasManageRoles
                    ? "Bot-Hierarchie Status"
                    : "Bot-Permission Problem"}
                </h3>
                <div
                  className={`mt-2 text-sm ${
                    botInfo.hasManageRoles
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {botInfo.hasManageRoles ? (
                    <div>
                      <p className="mb-2">
                        ✅ Bot hat "Manage Roles" Permission
                      </p>
                      <p>
                        🎭 Bot's höchste Rolle:{" "}
                        <strong>{botInfo.highestRoleName}</strong> (Position{" "}
                        {botInfo.highestRolePosition})
                      </p>
                      <p className="mt-1">
                        💡 Der Bot kann nur Rollen zuweisen, die{" "}
                        <strong>niedriger in der Hierarchie</strong> stehen als
                        seine eigene Rolle.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">
                        ❌ Bot hat keine "Manage Roles" Permission
                      </p>
                      <p>
                        🔧 Gehe zu Discord → Server Settings → Roles → Bot-Rolle
                        → Aktiviere "Manage Roles"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Filter Options */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Rollenfilter
            </h3>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Alle Rollen anzeigen
              </label>
              <button
                onClick={() => setShowAllRoles(!showAllRoles)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showAllRoles ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                }`}
                role="switch"
                aria-checked={showAllRoles}
              >
                <span className="sr-only">
                  {showAllRoles
                    ? "Nur zuweisbare Rollen anzeigen"
                    : "Alle Rollen anzeigen"}
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showAllRoles ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {showAllRoles ? (
              <p>🔍 Zeige alle Rollen (inklusive nicht zuweisbarer Rollen)</p>
            ) : (
              <p>✅ Zeige nur Rollen, die der Bot zuweisen kann</p>
            )}
          </div>
        </div>

        {/* Add new auto role */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Auto-Role hinzufügen
          </h3>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rolle auswählen
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Rolle auswählen...</option>
                {availableRoles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                    disabled={role.assignable === false}
                    className={role.assignable === false ? "text-gray-400" : ""}
                  >
                    {role.assignable === false ? "🚫 " : ""}
                    {role.name}
                    {role.assignable === false ? " (nicht zuweisbar)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAddAutoRole}
              disabled={!selectedRoleId || isAddingRole}
              isLoading={isAddingRole}
              variant="primary"
            >
              Hinzufügen
            </Button>
          </div>
        </div>

        {/* Auto roles list */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Konfigurierte Auto-Roles ({autoRoles.length})
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Lade Auto-Roles...
              </p>
            </div>
          ) : autoRoles.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Keine Auto-Roles konfiguriert
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Füge deine erste Auto-Role hinzu, um neue Mitglieder automatisch
                zu verwalten.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {autoRoles.map((autoRole) => {
                const role = roles.find((r) => r.id === autoRole.role_id);
                return (
                  <div
                    key={autoRole.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{
                            backgroundColor: role
                              ? `#${role.color.toString(16).padStart(6, "0")}`
                              : "#99aab5",
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {role ? role.name : autoRole.role_name}
                            {!role && (
                              <span className="text-red-500 ml-2">
                                (nicht gefunden)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hinzugefügt:{" "}
                            {new Date(autoRole.created_at).toLocaleDateString(
                              "de-DE",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          handleToggleRole(
                            autoRole.role_id,
                            !autoRole.is_active,
                          )
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          autoRole.is_active
                            ? "bg-blue-600"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                            autoRole.is_active
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>

                      <Button
                        onClick={() => handleDeleteRole(autoRole.role_id)}
                        variant="danger"
                        size="sm"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Auto-Role Funktionsweise
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Alle aktiven Auto-Roles werden automatisch neuen
                    Server-Mitgliedern zugewiesen
                  </li>
                  <li>
                    Der Bot benötigt die "Rollen verwalten" Berechtigung und
                    muss über den Auto-Roles in der Hierarchie stehen
                  </li>
                  <li>
                    Deaktivierte Auto-Roles werden nicht zugewiesen, bleiben
                    aber konfiguriert
                  </li>
                  <li>
                    System-Rollen und integrationsgesteuerte Rollen können nicht
                    als Auto-Roles verwendet werden
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoRoles;
