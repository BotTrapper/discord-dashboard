import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../lib/auth';
import DiscordAutocomplete from '../components/DiscordAutocomplete';
import {
  UserIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  UserGroupIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface Permission {
  id: number;
  type: 'user' | 'role';
  targetId: string;
  targetName: string;
  permissions: string[];
  createdAt: string;
  isOwner?: boolean;
  // Extended properties from Discord API
  avatar?: string;
  discriminator?: string;
  color?: number;
  position?: number;
}

interface AddPermissionForm {
  type: 'user' | 'role';
  targetId: string;
  targetName: string;
  permissions: string[];
}

export default function Permissions() {
  const { guildId } = useParams<{ guildId: string }>();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPermission, setAddingPermission] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

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

  // Funktion um aktuelle Namen von Discord zu holen
  const refreshPermissionNames = useCallback(async () => {
    if (!guildId || permissions.length === 0) return;

    try {
      const updatedPermissions = await Promise.all(
        permissions.map(async (permission) => {
          try {
            if (permission.type === 'user') {
              const members = await authService.getGuildMembers(guildId, permission.targetId);
              const member = members.find(m => m.id === permission.targetId);
              if (member) {
                return { ...permission, targetName: member.displayName || member.username };
              }
            } else if (permission.type === 'role') {
              const roles = await authService.getGuildRoles(guildId);
              const role = roles.find(r => r.id === permission.targetId);
              if (role) {
                return { ...permission, targetName: role.name };
              }
            }
          } catch {
            console.warn(`Could not refresh name for ${permission.type} ${permission.targetId}`);
          }
          return permission;
        })
      );

      setPermissions(updatedPermissions);
    } catch (err) {
      console.warn('Could not refresh permission names:', err);
    }
  }, [guildId, permissions]);

  // Aktualisiere Namen wenn Permissions geladen wurden
  useEffect(() => {
    if (permissions.length > 0) {
      refreshPermissionNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.length]);

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

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setShowEditForm(true);
  };

  const handleUpdatePermission = async () => {
    if (!guildId || !editingPermission) return;

    try {
      setError(null);

      await authService.removePermission(guildId, editingPermission.id);
      await authService.addPermission(guildId, {
        type: editingPermission.type,
        targetId: editingPermission.targetId,
        targetName: editingPermission.targetName,
        permissions: editingPermission.permissions
      });

      setShowEditForm(false);
      setEditingPermission(null);
      await loadPermissions();
    } catch (err) {
      console.error('Error updating permission:', err);
      setError('Fehler beim Aktualisieren der Berechtigung');
    }
  };

  const handleEditPermissionToggle = (permissionId: string) => {
    if (!editingPermission) return;

    setEditingPermission(prev => ({
      ...prev!,
      permissions: prev!.permissions.includes(permissionId)
        ? prev!.permissions.filter(p => p !== permissionId)
        : [...prev!.permissions, permissionId]
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <KeyIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
            Berechtigungen
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Verwalte wer Zugriff auf das Discord Server Control Panel hat
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center text-sm sm:text-base"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Berechtigung hinzufügen</span>
          <span className="sm:hidden">Hinzufügen</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Add Permission Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Neue Berechtigung hinzufügen
          </h2>

          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typ
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
              <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
              <div className="space-y-2 sm:space-y-3">
                {availablePermissions.map((perm) => (
                  <label key={perm.id} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={newPermission.permissions.includes(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {perm.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="order-2 sm:order-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddPermission}
                disabled={addingPermission}
                className="order-1 sm:order-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Aktuelle Berechtigungen
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {permissions.length} Berechtigung(en) konfiguriert
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {permissions.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ShieldCheckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                Keine Berechtigungen konfiguriert
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Füge Benutzer oder Rollen hinzu, die Zugriff auf das DSCP haben sollen.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${
                    permission.isOwner 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700' 
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center">
                    <div className="relative flex-shrink-0">
                      {permission.type === 'user' ? (
                        <div className="flex items-center">
                          {permission.avatar ? (
                            <img 
                              src={permission.avatar} 
                              alt={permission.targetName}
                              className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full mr-2 sm:mr-3 ${permission.isOwner ? 'ring-2 ring-yellow-500' : ''}`}
                            />
                          ) : (
                            <UserIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 sm:mt-0 ${permission.isOwner ? 'text-yellow-600' : 'text-blue-500'}`} />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div 
                            className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 rounded-full flex items-center justify-center ${permission.isOwner ? 'ring-2 ring-yellow-500' : ''}`}
                            style={{ backgroundColor: permission.color ? `#${permission.color.toString(16).padStart(6, '0')}` : '#99AAB5' }}
                          >
                            <UserGroupIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${permission.color && permission.color !== 0 ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                        </div>
                      )}
                      {permission.isOwner && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">👑</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                          {permission.targetName}
                          {permission.type === 'role' && permission.color && permission.color !== 0 && (
                            <span 
                              className="ml-2 inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                              style={{ backgroundColor: `#${permission.color.toString(16).padStart(6, '0')}` }}
                              title="Rollenfarbe"
                            />
                          )}
                        </h4>
                        {permission.isOwner && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full self-start">
                            Serverbesitzer
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="inline-flex items-center">
                          {permission.type === 'user' ? (
                            <>
                              <UserIcon className="h-3 w-3 mr-1" />
                              Benutzer
                              {permission.discriminator && permission.discriminator !== '0' && (
                                <span className="ml-1">#{permission.discriminator}</span>
                              )}
                            </>
                          ) : (
                            <>
                              <UserGroupIcon className="h-3 w-3 mr-1" />
                              Rolle
                              {permission.position && (
                                <span className="ml-1">• Pos. {permission.position}</span>
                              )}
                            </>
                          )}
                        </span>
                        <span className="ml-2 font-mono bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs">
                          ID: {permission.targetId.substring(0, 10)}...
                        </span>
                        {permission.isOwner && (
                          <span className="ml-2 text-yellow-600 dark:text-yellow-400">• Auto-Berechtigung</span>
                        )}
                      </div>
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
                  <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                    {permission.isOwner ? (
                      <div className="p-2 text-gray-400 cursor-not-allowed" title="Serverbesitzer-Berechtigungen können nicht entfernt werden">
                        <ShieldCheckIcon className="h-4 w-4" />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditPermission(permission)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Berechtigung bearbeiten"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemovePermission(permission.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Berechtigung entfernen"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Permission Form */}
      {showEditForm && editingPermission && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Berechtigung bearbeiten
          </h2>

          <div className="space-y-4">
            {/* Type Display */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typ
              </span>
              <div className="flex items-center space-x-2">
                {editingPermission.type === 'user' ? (
                  <>
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white">
                      Benutzer
                    </span>
                  </>
                ) : (
                  <>
                    <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    <span className="text-sm sm:text-base text-gray-900 dark:text-white">
                      Rolle
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Target Display */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {editingPermission.type === 'user' ? 'Benutzer' : 'Rolle'}
              </span>
              <div className="flex items-center">
                <div className="flex items-center">
                  {editingPermission.type === 'user' ? (
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 sm:mr-3" />
                  ) : (
                    <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3" />
                  )}
                  <span className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {editingPermission.targetName}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Berechtigungen
              </label>
              <div className="space-y-2 sm:space-y-3">
                {availablePermissions.map((perm) => (
                  <label key={perm.id} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={editingPermission.permissions.includes(perm.id)}
                      onChange={() => handleEditPermissionToggle(perm.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {perm.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <button
                onClick={() => setShowEditForm(false)}
                className="order-2 sm:order-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUpdatePermission}
                className="order-1 sm:order-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Aktualisieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
