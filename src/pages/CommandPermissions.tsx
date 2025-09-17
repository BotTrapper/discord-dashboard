import React, { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

interface Command {
  name: string;
  description: string;
}

interface CommandPermission {
  id: number;
  guild_id: string;
  role_id: string;
  role_name: string;
  allowed_commands: string[];
  denied_commands: string[];
  created_at: string;
  updated_at: string;
}

const CommandPermissions: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [commandPermissions, setCommandPermissions] = useState<
    CommandPermission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    allowedCommands: string[];
    deniedCommands: string[];
  }>({
    allowedCommands: [],
    deniedCommands: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, commandsData, permissionsData] = await Promise.all([
        api.get(`/api/guild/${guildId}/roles`),
        api.get("/api/available-commands"),
        api.get(`/api/command-permissions/${guildId}`),
      ]);

      setRoles(
        rolesData.data.filter(
          (role: Role) => !role.managed && role.id !== guildId,
        ),
      );
      setCommands(commandsData.data);
      setCommandPermissions(permissionsData.data);
      setError(null);
    } catch (error: any) {
      console.error("Error loading data:", error);
      setError(error.response?.data?.error || "Fehler beim Laden der Daten");
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    if (guildId) {
      fetchData();
    }
  }, [fetchData]);

  const handleEditRole = (roleId: string) => {
    const existingPermissions = commandPermissions.find(
      (cp) => cp.role_id === roleId,
    );
    setEditingRole(roleId);
    setEditData({
      allowedCommands: existingPermissions?.allowed_commands || [],
      deniedCommands: existingPermissions?.denied_commands || [],
    });
  };

  const handleSavePermissions = async () => {
    if (!editingRole || !guildId) return;

    const role = roles.find((r) => r.id === editingRole);
    if (!role) return;

    try {
      await api.put(`/api/command-permissions/${guildId}/${editingRole}`, {
        roleName: role.name,
        allowedCommands: editData.allowedCommands,
        deniedCommands: editData.deniedCommands,
      });

      setEditingRole(null);
      setEditData({ allowedCommands: [], deniedCommands: [] });
      await fetchData();
    } catch (error: any) {
      console.error("Failed to save command permissions:", error);
      setError(error.response?.data?.error || "Failed to save permissions");
    }
  };

  const handleDeletePermissions = async (roleId: string) => {
    if (
      !guildId ||
      !confirm(
        "Möchtest du die Command-Permissions für diese Rolle wirklich löschen?",
      )
    )
      return;

    try {
      await api.delete(`/api/command-permissions/${guildId}/${roleId}`);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete command permissions:", error);
      setError(error.response?.data?.error || "Failed to delete permissions");
    }
  };

  const handleCommandToggle = (
    commandName: string,
    type: "allowed" | "denied",
  ) => {
    if (type === "allowed") {
      const newAllowed = editData.allowedCommands.includes(commandName)
        ? editData.allowedCommands.filter((cmd) => cmd !== commandName)
        : [...editData.allowedCommands, commandName];

      // Remove from denied if adding to allowed
      const newDenied = newAllowed.includes(commandName)
        ? editData.deniedCommands.filter((cmd) => cmd !== commandName)
        : editData.deniedCommands;

      setEditData({
        allowedCommands: newAllowed,
        deniedCommands: newDenied,
      });
    } else {
      const newDenied = editData.deniedCommands.includes(commandName)
        ? editData.deniedCommands.filter((cmd) => cmd !== commandName)
        : [...editData.deniedCommands, commandName];

      // Remove from allowed if adding to denied
      const newAllowed = newDenied.includes(commandName)
        ? editData.allowedCommands.filter((cmd) => cmd !== commandName)
        : editData.allowedCommands;

      setEditData({
        allowedCommands: newAllowed,
        deniedCommands: newDenied,
      });
    }
  };

  const getPermissionStatus = (
    roleId: string,
    commandName: string,
  ): "allowed" | "denied" | "default" => {
    const permissions = commandPermissions.find((cp) => cp.role_id === roleId);
    if (!permissions) return "default";

    if (permissions.denied_commands.includes(commandName)) return "denied";
    if (permissions.allowed_commands.includes(commandName)) return "allowed";
    return "default";
  };

  if (!guildId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Command-Permissions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Kontrolliere welche Rollen welche Commands ausführen dürfen
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

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Lade Command-Permissions...
            </p>
          </div>
        ) : (
          <>
            {/* Command permissions table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rolle
                    </th>
                    {commands.map((command) => (
                      <th
                        key={command.name}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        <div className="flex flex-col items-center">
                          <span>{command.name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 normal-case">
                            {command.description}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {roles.map((role) => (
                    <tr
                      key={role.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mr-3"
                            style={{
                              backgroundColor: `#${role.color.toString(16).padStart(6, "0")}`,
                            }}
                          />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.name}
                          </div>
                        </div>
                      </td>
                      {commands.map((command) => {
                        const status =
                          editingRole === role.id
                            ? editData.deniedCommands.includes(command.name)
                              ? "denied"
                              : editData.allowedCommands.includes(command.name)
                                ? "allowed"
                                : "default"
                            : getPermissionStatus(role.id, command.name);

                        return (
                          <td
                            key={command.name}
                            className="px-3 py-4 whitespace-nowrap text-center"
                          >
                            {editingRole === role.id ? (
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() =>
                                    handleCommandToggle(command.name, "allowed")
                                  }
                                  className={`text-xs px-2 py-1 rounded transition-colors ${
                                    status === "allowed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-800/10"
                                  }`}
                                >
                                  Erlaubt
                                </button>
                                <button
                                  onClick={() =>
                                    handleCommandToggle(command.name, "denied")
                                  }
                                  className={`text-xs px-2 py-1 rounded transition-colors ${
                                    status === "denied"
                                      ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-800/10"
                                  }`}
                                >
                                  Verboten
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  status === "allowed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                    : status === "denied"
                                      ? "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {status === "allowed"
                                  ? "✓"
                                  : status === "denied"
                                    ? "✗"
                                    : "●"}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingRole === role.id ? (
                          <div className="flex justify-center space-x-2">
                            <Button
                              onClick={handleSavePermissions}
                              variant="primary"
                              size="sm"
                            >
                              Speichern
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingRole(null);
                                setEditData({
                                  allowedCommands: [],
                                  deniedCommands: [],
                                });
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              Abbrechen
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-center space-x-2">
                            <Button
                              onClick={() => handleEditRole(role.id)}
                              variant="secondary"
                              size="sm"
                            >
                              Bearbeiten
                            </Button>
                            {commandPermissions.some(
                              (cp) => cp.role_id === role.id,
                            ) && (
                              <Button
                                onClick={() => handleDeletePermissions(role.id)}
                                variant="danger"
                                size="sm"
                              >
                                Löschen
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
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
                    Command-Permission Funktionsweise
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <span className="font-medium">✓ Erlaubt:</span> Rolle
                        kann diesen Command explizit ausführen
                      </li>
                      <li>
                        <span className="font-medium">✗ Verboten:</span> Rolle
                        kann diesen Command explizit NICHT ausführen
                        (überschreibt Standard-Berechtigungen)
                      </li>
                      <li>
                        <span className="font-medium">● Standard:</span>{" "}
                        Standard-Berechtigungen (Discord-Permissions) gelten
                      </li>
                      <li>
                        <span className="font-medium">Priorität:</span> Verboten{" "}
                        {">"} Erlaubt {">"} Standard-Discord-Berechtigungen
                      </li>
                      <li>
                        <span className="font-medium">
                          Server-Owner & Global-Admins:
                        </span>{" "}
                        Haben immer Zugriff auf alle Commands
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommandPermissions;
