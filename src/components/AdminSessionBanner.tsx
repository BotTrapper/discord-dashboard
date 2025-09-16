import React, { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { ShieldCheckIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface AdminSessionBannerProps {
  guildId: string;
}

interface AdminSession {
  valid: boolean;
  userId?: string;
  adminLevel?: number;
  expiresAt?: number;
}

export const AdminSessionBanner: React.FC<AdminSessionBannerProps> = ({ guildId }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const checkAdminSession = useCallback(async () => {
    try {
      const sessionInfo = await api.validateAdminSession(guildId);
      if (sessionInfo.valid) {
        setSession(sessionInfo);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.warn("Failed to validate admin session:", error);
      setSession(null);
    }
  }, [guildId]);

  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  const clearSession = () => {
    api.clearAdminSession(guildId);
    setSession(null);
    setIsVisible(false);
    // Reload page to force re-authentication
    window.location.reload();
  };

  const formatTimeRemaining = (expiresAt: number): string => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return "Abgelaufen";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!session?.valid || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ShieldCheckIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              🔑 Admin-Modus aktiv
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Sie verwenden Admin-Berechtigung Level {session.adminLevel}
              </p>
              
              {session.expiresAt && (
                <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    Läuft ab in: {formatTimeRemaining(session.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
            title="Banner ausblenden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={clearSession}
            className="px-3 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            title="Admin-Session beenden"
          >
            Session beenden
          </button>
        </div>
      </div>
    </div>
  );
};