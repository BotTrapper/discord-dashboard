import { useState, useEffect } from 'react';
import { ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { getChangelog, type ChangelogEntry } from '../lib/changelog';
import { getVersion } from '../lib/version';

const changeTypeColors = {
  major: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  patch: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
};

const changeTypeIcons = {
  added: '✨',
  changed: '🔄',
  fixed: '🐛',
  removed: '🗑️'
};

const changeTypeLabels = {
  added: 'Hinzugefügt',
  changed: 'Geändert',
  fixed: 'Behoben',
  removed: 'Entfernt'
};

function ChangelogEntryCard({ entry }: { entry: ChangelogEntry }) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <TagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Version {entry.version}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${changeTypeColors[entry.type]}`}>
            {entry.type.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          {formatDate(entry.date)}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(entry.changes).map(([type, items]) => {
          if (!items || items.length === 0) return null;
          
          return (
            <div key={type}>
              <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span className="mr-2">{changeTypeIcons[type as keyof typeof changeTypeIcons]}</span>
                {changeTypeLabels[type as keyof typeof changeTypeLabels]}
              </h4>
              <ul className="space-y-1 ml-6">
                {items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Changelog() {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentVersion = getVersion();

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setLoading(true);
        const data = await getChangelog();
        setChangelog(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load changelog:', err);
        setError('Failed to load changelog data');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Loading Changelog...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Fetching the latest updates...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-12 text-center">
          <TagIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Error Loading Changelog
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Changelog
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Alle Änderungen und Updates von BotTrapper
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Aktuelle Version</div>
            <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              v{currentVersion}
            </div>
          </div>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-6">
        {changelog.length > 0 ? (
          changelog.map((entry) => (
            <ChangelogEntryCard key={entry.version} entry={entry} />
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Kein Changelog verfügbar
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Es sind noch keine Changelog-Einträge verfügbar.
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Versionierung
            </h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              <p>
                BotTrapper folgt der <a href="https://semver.org/" target="_blank" rel="noopener noreferrer" className="underline">Semantic Versioning</a> Konvention:
              </p>
              <ul className="mt-2 list-disc list-inside">
                <li><strong>Major:</strong> Breaking changes und große neue Features</li>
                <li><strong>Minor:</strong> Neue Features (rückwärtskompatibel)</li>
                <li><strong>Patch:</strong> Bug fixes und kleine Verbesserungen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}