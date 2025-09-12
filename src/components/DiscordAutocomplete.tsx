import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon, CheckIcon, XMarkIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline';
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
        console.log(`Loaded roles:`, roles);
        
        // Validate that roles is an array
        if (!Array.isArray(roles)) {
          console.error('Invalid roles data:', roles);
          throw new Error('Server returned invalid roles data');
        }
        
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
        console.log(`Loaded members:`, members);
        
        // Validate that members is an array
        if (!Array.isArray(members)) {
          console.error('Invalid members data:', members);
          throw new Error('Server returned invalid members data');
        }
        
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
          className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
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
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Laden...</p>
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {type === 'user' && searchQuery.length < 2
                  ? 'Mindestens 2 Zeichen eingeben'
                  : `Keine ${type === 'user' ? 'Benutzer' : 'Rollen'} gefunden`
                }
              </p>
            </div>
          ) : (
            <div className="py-1">
              {options.slice(0, 50).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {option.type === 'user' ? (
                      <UserIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <UserGroupIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getRoleColor(option.color || 0) }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                        {option.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {option.type === 'user' ? 'Benutzer' : 'Rolle'} • {option.id}
                      </p>
                    </div>
                  </div>
                  {value?.id === option.id && (
                    <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
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
