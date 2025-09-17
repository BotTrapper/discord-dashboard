import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Feature {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
}

interface FeatureToggleProps {
  guildId: string;
}

export default function FeatureToggle({ guildId }: FeatureToggleProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeatures();
  }, [guildId]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/guilds/${guildId}/features`);
      setFeatures(response.data);
    } catch (error) {
      console.error('Error loading features:', error);
      setError('Fehler beim Laden der Features');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureName: string, enabled: boolean) => {
    try {
      setUpdating(featureName);
      setError(null);
      
      await api.put(`/api/guilds/${guildId}/features/${featureName}`, {
        enabled
      });
      
      // Update local state
      setFeatures(prev => prev.map(f => 
        f.name === featureName ? { ...f, enabled } : f
      ));
      
      // Show success message briefly
      const feature = features.find(f => f.name === featureName);
      if (feature) {
        console.log(`✅ ${feature.displayName} ${enabled ? 'aktiviert' : 'deaktiviert'}`);
      }
      
    } catch (error: any) {
      console.error('Error toggling feature:', error);
      setError(error.response?.data?.error || 'Fehler beim Aktualisieren der Einstellung');
      // Revert local state on error
      setFeatures(prev => prev.map(f => 
        f.name === featureName ? { ...f, enabled: !enabled } : f
      ));
    } finally {
      setUpdating(null);
    }
  };

  const getFeatureIcon = (featureName: string) => {
    switch (featureName) {
      case 'autoroles': return '🎭';
      case 'tickets': return '🎫';
      case 'autoresponses': return '💬';
      case 'statistics': return '📊';
      default: return '⚙️';
    }
  };

  const getFeatureColor = (enabled: boolean, featureName: string) => {
    if (!enabled) return 'text-gray-400 dark:text-gray-600';
    
    switch (featureName) {
      case 'autoroles': return 'text-purple-600 dark:text-purple-400';
      case 'tickets': return 'text-blue-600 dark:text-blue-400';
      case 'autoresponses': return 'text-green-600 dark:text-green-400';
      case 'statistics': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600 dark:text-gray-300">Lade Feature-Einstellungen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          🔧 Bot Features
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Aktiviere oder deaktiviere verschiedene Bot-Funktionen für diesen Server.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`text-2xl ${getFeatureColor(feature.enabled, feature.name)}`}>
                  {getFeatureIcon(feature.name)}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.displayName}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  feature.enabled
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {feature.enabled ? 'Aktiviert' : 'Deaktiviert'}
                </span>

                <button
                  onClick={() => toggleFeature(feature.name, !feature.enabled)}
                  disabled={updating === feature.name}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    feature.enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${updating === feature.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="switch"
                  aria-checked={feature.enabled}
                >
                  <span className="sr-only">
                    {feature.enabled ? 'Deaktivieren' : 'Aktivieren'} {feature.displayName}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      feature.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                  {updating === feature.name && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Wichtige Hinweise
            </h3>
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              <ul className="list-disc list-inside space-y-1">
                <li>Slash Commands werden automatisch basierend auf aktivierten Features registriert</li>
                <li>Das Deaktivieren von Features entfernt die entsprechenden Commands aus Discord</li>
                <li>Änderungen werden sofort wirksam und erfordern keinen Bot-Neustart</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}