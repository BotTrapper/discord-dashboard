import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Configure axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

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
  guildName: string;
  guildIcon: string;
  memberCount: number;
  ticketCount: number;
  autoResponseCount: number;
  openTickets: number;
}

class AuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    // Check for token in URL params (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      this.token = token;
      localStorage.setItem('discord_token', token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check localStorage
      this.token = localStorage.getItem('discord_token');
    }
  }

  async login() {
    window.location.href = `${API_BASE_URL}/auth/discord`;
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('discord_token');
    window.location.href = `${API_BASE_URL}/auth/logout`;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await axios.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      this.user = response.data;
      return this.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      return null;
    }
  }

  async getDashboardStats(guildId: string): Promise<DashboardStats> {
    const response = await axios.get(`/api/dashboard/${guildId}/stats`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): User | null {
    return this.user;
  }
}

export const authService = new AuthService();
