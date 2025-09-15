import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Configure axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - redirecting to login");

      // Clear any stored token
      localStorage.removeItem("discord_token");

      // Don't redirect if we're already on login page to avoid infinite loops
      if (!window.location.pathname.includes("/login")) {
        // Use replace instead of href to avoid adding to history
        window.location.replace("/login?error=unauthorized");
        return Promise.reject(error); // Stop execution here
      }
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  guilds: Guild[];
}

export interface Guild {
  id: string;
  name: string;
  icon: string;
  permissions: number;
}

export interface DashboardStats {
  // Basic guild info
  guildName: string;
  guildIcon: string;
  guildId: string;
  ownerId: string;

  // Member statistics
  totalMembers: number;
  onlineMembers: number;
  botMembers: number;
  humanMembers: number;

  // Channel statistics
  totalChannels: number;
  textChannels: number;
  voiceChannels: number;
  categories: number;

  // Role statistics
  totalRoles: number;

  // Server info
  verificationLevel: number;
  premiumTier: number;
  premiumSubscriptionCount: number;

  // Creation date
  createdAt: string;
  botJoinedAt?: string;

  // Bot-specific stats
  ticketCount: number;
  autoResponseCount: number;
  openTickets: number;
}

export interface Permission {
  id: number;
  type: "user" | "role";
  targetId: string;
  targetName: string;
  permissions: string[];
  createdAt: string;
}

export interface AddPermissionRequest {
  type: "user" | "role";
  targetId: string;
  targetName: string;
  permissions: string[];
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

export interface DiscordMember {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  discriminator: string;
}

class AuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    // Check for token in URL params (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      this.token = token;
      localStorage.setItem("discord_token", token);
      // Clean URL but preserve the path
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.pathname + url.hash);
      console.log(
        "✅ Token found in URL and stored:",
        token.substring(0, 10) + "...",
      );
    } else {
      // Check localStorage
      this.token = localStorage.getItem("discord_token");
      if (this.token) {
        console.log(
          "✅ Token loaded from localStorage:",
          this.token.substring(0, 10) + "...",
        );
      } else {
        console.log("⚠️ No token found in URL or localStorage");
      }
    }
  }

  private getAuthHeaders() {
    if (!this.token) {
      console.warn("No token available for API call");
      return {};
    }
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  async login() {
    console.log("Redirecting to Discord OAuth...");
    window.location.href = `${API_BASE_URL}/auth/discord`;
  }

  logout(redirectToBackend: boolean = false) {
    console.log("Logging out...");
    this.user = null;
    this.token = null;
    localStorage.removeItem("discord_token");

    if (redirectToBackend) {
      // Explicit logout - call backend logout endpoint
      window.location.href = `${API_BASE_URL}/auth/logout`;
    } else {
      // Just clear local state and redirect to login
      if (!window.location.pathname.includes("/login")) {
        window.location.replace("/login");
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      console.warn("❌ No token available for getCurrentUser");
      return null;
    }

    try {
      console.log(
        "🔄 Fetching current user with token:",
        this.token.substring(0, 10) + "...",
      );
      const response = await axios.get("/auth/me", {
        headers: this.getAuthHeaders(),
      });
      this.user = response.data;
      console.log(
        "✅ Current user fetched successfully:",
        this.user?.username || "No username",
      );
      console.log("👤 User data:", {
        id: this.user?.id,
        username: this.user?.username,
        discriminator: this.user?.discriminator,
        guilds: this.user?.guilds?.length || 0,
      });
      return this.user;
    } catch (error: any) {
      console.error("❌ Failed to get current user:", error);

      if (error.response?.status === 401) {
        console.log("🚪 Token expired or invalid, clearing local state...");
        // Just clear local state, don't redirect to backend
        this.user = null;
        this.token = null;
        localStorage.removeItem("discord_token");
      } else {
        console.log("🔄 Network or server error, keeping token for retry");
      }

      return null;
    }
  }

  async getDashboardStats(guildId: string): Promise<DashboardStats> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    console.log("Fetching dashboard stats for guild:", guildId);
    console.log("Using token:", this.token.substring(0, 10) + "...");

    const response = await axios.get(`/api/dashboard/${guildId}/stats`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.token;
    console.log("Authentication status:", isAuth);
    return isAuth;
  }

  getUser(): User | null {
    return this.user;
  }

  // Permission management methods
  async getPermissions(guildId: string): Promise<Permission[]> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.get(`/api/permissions/${guildId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async addPermission(
    guildId: string,
    permission: AddPermissionRequest,
  ): Promise<{ id: number; success: boolean }> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.post(
      `/api/permissions/${guildId}`,
      permission,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return response.data;
  }

  async removePermission(
    guildId: string,
    permissionId: number,
  ): Promise<{ success: boolean }> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.delete(
      `/api/permissions/${guildId}/${permissionId}`,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return response.data;
  }

  // Discord data fetching methods
  async getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.get(`/api/discord/${guildId}/roles`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getGuildMembers(
    guildId: string,
    search?: string,
  ): Promise<DiscordMember[]> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    const url = `/api/discord/${guildId}/members${search ? `?search=${encodeURIComponent(search)}` : ""}`;
    const response = await axios.get(url, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Generic API request method
  async apiRequest(endpoint: string, options?: RequestInit): Promise<Response> {
    if (!this.token) {
      throw new Error("No authentication token available");
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
      ...options,
    };

    return fetch(url, defaultOptions);
  }
}

// Export singleton instance
export const authService = new AuthService();
