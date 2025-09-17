/**
 * Version utility to get version information
 */

// This will be set during build time by Vite
export const VERSION = __APP_VERSION__ || "1.1.0";
export const BUILD_DATE = __BUILD_DATE__ || new Date().toISOString();

export function getVersion(): string {
  return VERSION;
}

export function getVersionInfo() {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    commit: import.meta.env.VITE_COMMIT_HASH || "unknown",
  };
}
