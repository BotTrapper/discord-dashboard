import axios from 'axios';

// Configure axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
axios.defaults.withCredentials = true;

export interface Ticket {
  id: number;
  user_id: string;
  username: string;
  reason: string;
  status: string;
  channel_id: string;
  created_at: string;
  closed_at?: string;
  guild_id: string;
}

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

export interface Webhook {
  id: number;
  name: string;
  url: string;
  guild_id: string;
  created_at: string;
}

export interface CommandStat {
  command_name: string;
  usage_count: number;
}

export interface Activity {
  type: string;
  description: string;
  timestamp: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('discord_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Tickets API
  async getTickets(guildId: string, status?: string): Promise<Ticket[]> {
    const params = status ? { status } : {};
    const response = await axios.get(`/api/tickets/${guildId}`, {
      params,
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async createTicket(ticketData: {
    userId: string;
    username: string;
    reason: string;
    channelId: string;
    guildId: string;
  }): Promise<{ id: number; success: boolean }> {
    const response = await axios.post('/api/tickets', ticketData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async closeTicket(ticketId: number): Promise<{ success: boolean }> {
    const response = await axios.patch(`/api/tickets/${ticketId}/close`, {}, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteTicket(ticketId: number): Promise<{ success: boolean }> {
    const response = await axios.delete(`/api/tickets/${ticketId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Auto Responses API
  async getAutoResponses(guildId: string): Promise<AutoResponse[]> {
    const response = await axios.get(`/api/autoresponses/${guildId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async createAutoResponse(responseData: {
    trigger: string;
    response: string;
    isEmbed: boolean;
    embedTitle?: string;
    embedDescription?: string;
    embedColor?: number;
    guildId: string;
  }): Promise<{ id: number; success: boolean }> {
    const response = await axios.post('/api/autoresponses', responseData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteAutoResponse(guildId: string, trigger: string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/api/autoresponses/${guildId}/${encodeURIComponent(trigger)}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Statistics API
  async getCommandStats(guildId: string, days: number = 30): Promise<CommandStat[]> {
    const response = await axios.get(`/api/stats/${guildId}`, {
      params: { days },
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Webhooks API
  async getWebhooks(guildId: string): Promise<Webhook[]> {
    const response = await axios.get(`/api/webhooks/${guildId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async createWebhook(webhookData: {
    name: string;
    url: string;
    guildId: string;
  }): Promise<{ id: number; success: boolean }> {
    const response = await axios.post('/api/webhooks', webhookData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteWebhook(guildId: string, name: string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/api/webhooks/${guildId}/${encodeURIComponent(name)}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}

export const apiService = new ApiService();
