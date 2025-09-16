// Types - move to top level exports
export interface AutoResponse {
  id: number;
  trigger_word: string;
  response_text: string;
  is_embed: boolean;
  embed_title?: string;
  embed_description?: string;
  embed_color?: number;
  guild_id: string;
  created_at: string;
}

export interface TicketCategory {
  id: number;
  guild_id: string;
  name: string;
  description?: string;
  emoji?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Try both possible token storage keys
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("discord_token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          console.log(
            `🔑 Adding Authorization header to ${config.method?.toUpperCase()} ${config.url}`,
          );
        } else {
          console.log(
            `❌ No token found in localStorage for ${config.method?.toUpperCase()} ${config.url}`,
          );
        }

        // Add admin session token if available
        const guildIdMatch = config.url?.match(/\/(\d+)(?:\/|$)/);
        if (guildIdMatch) {
          const guildId = guildIdMatch[1];
          const adminSessionToken = localStorage.getItem(
            `admin-session-${guildId}`,
          );
          if (adminSessionToken) {
            config.headers = config.headers || {};
            config.headers["x-admin-session"] = adminSessionToken;
            console.log(`🔑 Using admin session token for guild ${guildId}`);
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url);
  }

  async post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data);
  }

  async patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data);
  }

  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url);
  }

  // Auto Response specific methods
  async getAutoResponses(guildId: string): Promise<AutoResponse[]> {
    const response = await this.get<AutoResponse[]>(
      `/api/autoresponses/${guildId}`,
    );
    return response.data;
  }

  async createAutoResponse(data: {
    trigger: string;
    response: string;
    isEmbed: boolean;
    embedTitle?: string;
    embedDescription?: string;
    embedColor?: number;
    guildId: string;
  }): Promise<void> {
    await this.post(`/api/autoresponses/${data.guildId}`, data);
  }

  async deleteAutoResponse(guildId: string, trigger: string): Promise<void> {
    await this.delete(
      `/api/autoresponses/${guildId}/${encodeURIComponent(trigger)}`,
    );
  }

  // Ticket Categories specific methods
  async getTicketCategories(
    guildId: string,
    includeInactive = false,
  ): Promise<TicketCategory[]> {
    const response = await this.get<TicketCategory[]>(
      `/api/ticket-categories/${guildId}?includeInactive=${includeInactive}`,
    );
    return response.data;
  }

  async createTicketCategory(
    guildId: string,
    data: {
      name: string;
      description?: string;
      emoji?: string;
      color?: string;
      sortOrder?: number;
    },
  ): Promise<{ id: number; success: boolean }> {
    const response = await this.post<{ id: number; success: boolean }>(
      `/api/ticket-categories/${guildId}`,
      data,
    );
    return response.data;
  }

  async updateTicketCategory(
    guildId: string,
    categoryId: number,
    data: {
      name?: string;
      description?: string;
      emoji?: string;
      color?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ): Promise<{ success: boolean }> {
    const response = await this.put<{ success: boolean }>(
      `/api/ticket-categories/${guildId}/${categoryId}`,
      data,
    );
    return response.data;
  }

  async deleteTicketCategory(
    guildId: string,
    categoryId: number,
  ): Promise<{ success: boolean }> {
    const response = await this.delete<{ success: boolean }>(
      `/api/ticket-categories/${guildId}/${categoryId}`,
    );
    return response.data;
  }

  // Admin Session Management
  async generateAdminSession(guildId: string): Promise<{
    sessionToken: string;
    guildId: string;
    adminLevel: number;
    expiresAt: number;
  }> {
    const response = await this.post<{
      sessionToken: string;
      guildId: string;
      adminLevel: number;
      expiresAt: number;
    }>(`/api/admin/session/${guildId}`, {});

    // Store session token for automatic use
    localStorage.setItem(
      `admin-session-${guildId}`,
      response.data.sessionToken,
    );
    console.log(`🔑 Generated admin session for guild ${guildId}`);

    return response.data;
  }

  async validateAdminSession(guildId: string): Promise<{
    valid: boolean;
    userId?: string;
    adminLevel?: number;
    expiresAt?: number;
  }> {
    const adminSessionToken = localStorage.getItem(`admin-session-${guildId}`);
    if (!adminSessionToken) {
      return { valid: false };
    }

    try {
      // Temporarily add the header manually for validation
      const originalHeaders = this.axiosInstance.defaults.headers;
      this.axiosInstance.defaults.headers["x-admin-session"] =
        adminSessionToken;

      const response = await this.get<{
        valid: boolean;
        userId: string;
        guildId: string;
        adminLevel: number;
        expiresAt: number;
      }>(`/api/admin/session/validate/${guildId}`);

      // Restore original headers
      this.axiosInstance.defaults.headers = originalHeaders;

      return response.data;
    } catch (error) {
      console.warn(
        `❌ Admin session validation failed for guild ${guildId}:`,
        error,
      );
      localStorage.removeItem(`admin-session-${guildId}`);
      return { valid: false };
    }
  }

  clearAdminSession(guildId: string): void {
    localStorage.removeItem(`admin-session-${guildId}`);
    console.log(`🗑️ Cleared admin session for guild ${guildId}`);
  }

  // Check if user has admin session for guild
  hasAdminSession(guildId: string): boolean {
    return !!localStorage.getItem(`admin-session-${guildId}`);
  }
}

export const api = new ApiService();
