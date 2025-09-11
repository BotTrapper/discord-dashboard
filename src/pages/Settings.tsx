import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../lib/auth';
import DiscordAutocomplete from '../components/DiscordAutocomplete';
import {
  UserIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Permission {
  id: number;
  type: 'user' | 'role';
  targetId: string;
  targetName: string;
  permissions: string[];
  createdAt: string;
  isOwner?: boolean; // Add optional flag for server owner
}

interface AddPermissionForm {
  type: 'user' | 'role';
  targetId: string;
  targetName: string;
  permissions: string[];
}

export default function Settings() {
  const { guildId } = useParams<{ guildId: string }>();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPermission, setAddingPermission] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newPermission, setNewPermission] = useState<AddPermissionForm>({
    type: 'user',
    targetId: '',
    targetName: '',
    permissions: ['dashboard.view']
  });

  const availablePermissions = [
    { id: 'dashboard.view', label: 'Dashboard anzeigen', description: 'Kann das Dashboard öffnen und grundlegende Statistiken sehen' },
    { id: 'dashboard.admin', label: 'Dashboard verwalten', description: 'Vollzugriff auf alle Dashboard-Funktionen' },
    { id: 'tickets.view', label: 'Tickets anzeigen', description: 'Kann Ticket-System einsehen' },
    { id: 'tickets.manage', label: 'Tickets verwalten', description: 'Kann Tickets erstellen, bearbeiten und löschen' },
    { id: 'autoresponse.view', label: 'Auto-Responses anzeigen', description: 'Kann Auto-Response-Einstellungen einsehen' },
    { id: 'autoresponse.manage', label: 'Auto-Responses verwalten', description: 'Kann Auto-Responses erstellen und bearbeiten' },
  ];

  const loadPermissions = useCallback(async () => {
    if (!guildId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await authService.getPermissions(guildId);
      setPermissions(data);
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('Fehler beim Laden der Berechtigungen');
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleAddPermission = async () => {
    if (!guildId || !newPermission.targetId.trim() || !newPermission.targetName.trim()) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }

    try {
      setAddingPermission(true);
      setError(null);

      await authService.addPermission(guildId, {
        type: newPermission.type,
        targetId: newPermission.targetId.trim(),
        targetName: newPermission.targetName.trim(),
        permissions: newPermission.permissions
      });

      // Reset form and reload permissions
      setNewPermission({
        type: 'user',
        targetId: '',
        targetName: '',
        permissions: ['dashboard.view']
      });
      setShowAddForm(false);
      await loadPermissions();
    } catch (err) {
      console.error('Error adding permission:', err);
      setError('Fehler beim Hinzufügen der Berechtigung');
    } finally {
      setAddingPermission(false);
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    if (!guildId) return;

    try {
      setError(null);
      await authService.removePermission(guildId, permissionId);
      await loadPermissions();
    } catch (err) {
      console.error('Error removing permission:', err);
      setError('Fehler beim Entfernen der Berechtigung');
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setNewPermission(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-16"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Cog6ToothIcon className="h-8 w-8 mr-3" />
            DSCP Einstellungen
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verwalte wer Zugriff auf das Discord Server Control Panel hat
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Berechtigung hinzufügen
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Add Permission Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Neue Berechtigung hinzufügen
          </h2>

          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typ
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="user"
                    checked={newPermission.type === 'user'}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, type: e.target.value as 'user' | 'role' }))}
                    className="mr-2"
                  />
                  <UserIcon className="h-4 w-4 mr-1" />
                  Benutzer
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="role"
                    checked={newPermission.type === 'role'}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, type: e.target.value as 'user' | 'role' }))}
                    className="mr-2"
                  />
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  Rolle
                </label>
              </div>
            </div>

            {/* Target Selection with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {newPermission.type === 'user' ? 'Benutzer auswählen' : 'Rolle auswählen'}
              </label>
              <DiscordAutocomplete
                guildId={guildId!}
                type={newPermission.type}
                value={newPermission.targetId && newPermission.targetName ?
                  { id: newPermission.targetId, name: newPermission.targetName } : null
                }
                onChange={(selected) => {
                  if (selected) {
                    setNewPermission(prev => ({
                      ...prev,
                      targetId: selected.id,
                      targetName: selected.name
                    }));
                  } else {
                    setNewPermission(prev => ({
                      ...prev,
                      targetId: '',
                      targetName: ''
                    }));
                  }
                }}
                placeholder={`${newPermission.type === 'user' ? 'Benutzer' : 'Rolle'} suchen und auswählen...`}
              />

              {/* Manual Input Fallback */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Oder manuell eingeben:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Discord-ID
                    </label>
                    <input
                      type="text"
                      value={newPermission.targetId}
                      onChange={(e) => setNewPermission(prev => ({ ...prev, targetId: e.target.value }))}
                      placeholder={newPermission.type === 'user' ? 'z.B. 123456789012345678' : 'z.B. 987654321098765432'}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {newPermission.type === 'user' ? 'Benutzername' : 'Rollenname'}
                    </label>
                    <input
                      type="text"
                      value={newPermission.targetName}
                      onChange={(e) => setNewPermission(prev => ({ ...prev, targetName: e.target.value }))}
                      placeholder={newPermission.type === 'user' ? 'z.B. Julscha' : 'z.B. Moderator'}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {newPermission.type === 'user'
                    ? 'Rechtsklick auf den Benutzer in Discord → "ID kopieren" aktivieren unter Erweitert → Entwicklermodus'
                    : 'Rechtsklick auf die Rolle in Discord → "ID kopieren" aktivieren unter Erweitert → Entwicklermodus'
                  }
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Berechtigungen
              </label>
              <div className="space-y-3">
                {availablePermissions.map((perm) => (
                  <label key={perm.id} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={newPermission.permissions.includes(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {perm.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddPermission}
                disabled={addingPermission}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {addingPermission ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Wird hinzugefügt...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Aktuelle Berechtigungen
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {permissions.length} Berechtigung(en) konfiguriert
          </p>
        </div>

        <div className="p-6">
          {permissions.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Keine Berechtigungen konfiguriert
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Füge Benutzer oder Rollen hinzu, die Zugriff auf das DSCP haben sollen.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    permission.isOwner 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      {permission.type === 'user' ? (
                        <UserIcon className={`h-5 w-5 mr-3 ${permission.isOwner ? 'text-yellow-600' : 'text-blue-500'}`} />
                      ) : (
                        <UserGroupIcon className={`h-5 w-5 mr-3 ${permission.isOwner ? 'text-yellow-600' : 'text-green-500'}`} />
                      )}
                      {permission.isOwner && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">👑</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {permission.targetName}
                        </h4>
                        {permission.isOwner && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                            Serverbesitzer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.type === 'user' ? 'Benutzer' : 'Rolle'} • ID: {permission.targetId}
                        {permission.isOwner && (
                          <span className="ml-2 text-yellow-600 dark:text-yellow-400">• Automatische Berechtigung</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {permission.permissions.map((perm) => {
                          const permInfo = availablePermissions.find(p => p.id === perm);
                          return (
                            <span
                              key={perm}
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                permission.isOwner
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                              }`}
                            >
                              {permInfo?.label || perm}
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {permission.isOwner
                          ? `Server erstellt: ${formatDate(permission.createdAt)}`
                          : `Hinzugefügt: ${formatDate(permission.createdAt)}`
                        }
                      </p>
                    </div>
                  </div>
                  {permission.isOwner ? (
                    <div className="p-2 text-gray-400 cursor-not-allowed" title="Serverbesitzer-Berechtigungen können nicht entfernt werden">
                      <ShieldCheckIcon className="h-4 w-4" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRemovePermission(permission.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Berechtigung entfernen"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
