import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { authService } from '../lib/auth';

interface AutocompleteOption {
  id: string;
  name: string;
  type: 'user' | 'role';
  avatar?: string;
  color?: number;
}

interface DiscordAutocompleteProps {
  guildId: string;
  type: 'user' | 'role';
  value: { id: string; name: string } | null;
  onChange: (option: { id: string; name: string } | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function DiscordAutocomplete({
  guildId,
  type,
  value,
  onChange,
  placeholder,
  disabled = false
}: DiscordAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadOptions = useCallback(async (query?: string) => {
    if (!guildId) return;

    try {
      setLoading(true);
      setError(null);
      console.log(`Loading options for ${type} with query:`, query);

      // Add timeout to frontend requests as well
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      if (type === 'role') {
        const roles = await authService.getGuildRoles(guildId);
        console.log(`Loaded ${roles.length} roles`);
        const roleOptions: AutocompleteOption[] = roles
          .filter(role => !role.managed && role.name !== '@everyone')
          .map(role => ({
            id: role.id,
            name: role.name,
            type: 'role' as const,
            color: role.color
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setOptions(roleOptions);
      } else {
        const members = await authService.getGuildMembers(guildId, query);
        console.log(`Loaded ${members.length} members with query "${query}"`);
        const memberOptions: AutocompleteOption[] = members
          .map(member => ({
            id: member.id,
            name: member.displayName || member.username,
            type: 'user' as const,
            avatar: member.avatar
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setOptions(memberOptions);
      }

      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error('Error loading options:', err);

      // Better error messages based on error type
      if (err.name === 'AbortError') {
        setError('Anfrage dauert zu lange - versuche es erneut');
      } else if (err.message?.includes('503')) {
        setError('Discord Bot ist nicht bereit - warte einen Moment');
      } else if (err.message?.includes('404')) {
        setError('Server wurde nicht gefunden');
      } else {
        setError(`Fehler beim Laden der ${type === 'role' ? 'Rollen' : 'Benutzer'}`);
      }
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [guildId, type]);

  // Load initial data when component mounts or type changes
  useEffect(() => {
    if (guildId && isOpen) {
      loadOptions();
    }
  }, [guildId, type, isOpen, loadOptions]);

  // Handle search query changes with debouncing
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      if (type === 'user' && searchQuery.length >= 2) {
        loadOptions(searchQuery);
      } else if (type === 'role') {
        loadOptions();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, type, isOpen, loadOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (option: AutocompleteOption) => {
    onChange({ id: option.id, name: option.name });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (type === 'user' && query.length < 2 && query.length > 0) {
      setError('Mindestens 2 Zeichen eingeben');
    } else {
      setError(null);
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getDisplayValue = () => {
    if (value) return value.name;
    if (searchQuery) return searchQuery;
    return '';
  };

  const getRoleColor = (color: number) => {
    if (color === 0) return '#99aab5'; // Default Discord color
    return `#${color.toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder || `${type === 'role' ? 'Rolle' : 'Benutzer'} auswählen...`}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            disabled 
              ? 'border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50' 
              : 'border-gray-300 dark:border-gray-600 cursor-pointer'
          } ${error ? 'border-red-500 dark:border-red-500' : ''}`}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
              Wird geladen...
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
              {type === 'user' && searchQuery.length < 2
                ? 'Gib mindestens 2 Zeichen ein...'
                : type === 'user'
                ? 'Keine Benutzer gefunden. Für kleine Server gib bitte Discord-ID und Name manuell ein.'
                : `Keine ${type === 'role' ? 'Rollen' : 'Benutzer'} gefunden`}
            </div>
          ) : (
            <div>
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                    value?.id === option.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {option.type === 'user' && option.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${option.id}/${option.avatar}.png?size=32`}
                        alt={option.name}
                        className="w-6 h-6 rounded-full mr-3"
                      />
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs font-bold text-white ${
                          option.type === 'role' ? '' : 'bg-gray-400'
                        }`}
                        style={option.type === 'role' && option.color ?
                          { backgroundColor: getRoleColor(option.color) } :
                          undefined
                        }
                      >
                        {option.type === 'role' ? '@' : option.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-900 dark:text-white">{option.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {option.id}
                      </p>
                    </div>
                  </div>
                  {value?.id === option.id && (
                    <CheckIcon className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
