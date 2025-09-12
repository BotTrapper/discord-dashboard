import { api } from "./api";

export interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  changes: {
    added?: string[];
    changed?: string[];
    fixed?: string[];
    removed?: string[];
  };
}

// Local fallback data
const fallbackChangelog: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2025-09-12",
    type: "major",
    changes: {
      added: [
        "Initial release of BotTrapper",
        "Ticket system with categories",
        "Auto-response system with embed support",
        "Permission management system",
        "Statistics dashboard",
        "Feature toggle system",
        "Discord OAuth2 dashboard",
        "Version tracking and changelog",
        "Footer mit Versionierung und Julscha Copyright",
      ],
      changed: [],
      fixed: [],
      removed: [],
    },
  },
];

// Cache for changelog data
let changelogCache: ChangelogEntry[] | null = null;

export async function getChangelog(): Promise<ChangelogEntry[]> {
  // Return cache if available
  if (changelogCache) {
    return changelogCache;
  }

  try {
    const response = await api.get("/api/changelog");
    const data = response.data as ChangelogEntry[];
    changelogCache = data;
    return data;
  } catch (error) {
    console.warn("Failed to fetch changelog from API, using fallback:", error);
    return fallbackChangelog;
  }
}

export async function getLatestVersion(): Promise<ChangelogEntry | null> {
  const changelog = await getChangelog();
  return changelog.length > 0 ? changelog[0] : null;
}

export async function getVersionByNumber(
  version: string,
): Promise<ChangelogEntry | null> {
  const changelog = await getChangelog();
  return changelog.find((entry) => entry.version === version) || null;
}

export async function getChangelogSummary(
  maxEntries = 5,
): Promise<ChangelogEntry[]> {
  const changelog = await getChangelog();
  return changelog.slice(0, maxEntries);
}

// Clear cache (useful for refreshing data)
export function clearChangelogCache(): void {
  changelogCache = null;
}
