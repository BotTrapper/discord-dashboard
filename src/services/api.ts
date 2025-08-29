const API_BASE_URL = 'http://localhost:3001/api';

export interface Ticket {
  id: number;
  user_id: string;
  username: string;
  reason: string;
  status: 'open' | 'closed';
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

class ApiService {
  private guildId = '123456789'; // Replace with actual guild ID

  // Tickets
  async getTickets(status?: string): Promise<Ticket[]> {
    try {
      const url = `${API_BASE_URL}/tickets/${this.guildId}${status ? `?status=${status}` : ''}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  async createTicket(ticketData: Omit<Ticket, 'id' | 'created_at' | 'guild_id'>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ticketData, guildId: this.guildId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return false;
    }
  }

  async closeTicket(ticketId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/close`, {
        method: 'PATCH'
      });
      return response.ok;
    } catch (error) {
      console.error('Error closing ticket:', error);
      return false;
    }
  }

  // Auto Responses
  async getAutoResponses(): Promise<AutoResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/autoresponses/${this.guildId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching auto responses:', error);
      return [];
    }
  }

  async createAutoResponse(responseData: Omit<AutoResponse, 'id' | 'created_at' | 'guild_id'>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/autoresponses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...responseData, guildId: this.guildId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating auto response:', error);
      return false;
    }
  }

  async deleteAutoResponse(trigger: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/autoresponses/${this.guildId}/${trigger}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting auto response:', error);
      return false;
    }
  }

  // Webhooks
  async getWebhooks(): Promise<Webhook[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/webhooks/${this.guildId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      return [];
    }
  }

  async createWebhook(webhookData: Omit<Webhook, 'id' | 'created_at' | 'guild_id'>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...webhookData, guildId: this.guildId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating webhook:', error);
      return false;
    }
  }

  // Statistics
  async getCommandStats(days: number = 30): Promise<CommandStat[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/${this.guildId}?days=${days}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching command stats:', error);
      return [];
    }
  }

  // Health check
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
