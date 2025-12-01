// src/types/index.ts

// User & Auth Types
export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  guilds?: Guild[];
}

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: number;
  memberCount?: number;
}

// Permission Types
export interface Permission {
  id: number;
  type: "user" | "role";
  targetId: string;
  targetName: string;
  permissions: string[];
  createdAt: string;
  isOwner?: boolean;
  avatar?: string;
  discriminator?: string;
  color?: number;
  position?: number;
}

// Admin Types
export interface GlobalSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  updated_by: string;
  updated_at: string;
}

export interface GlobalAdmin {
  id: number;
  user_id: string;
  username: string;
  level: number;
  granted_by: string;
  granted_at: string;
  is_active: boolean;
}

export interface AdminActivity {
  id: number;
  admin_user_id: string;
  admin_username: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  guild_id: string;
  created_at: string;
}

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  ownerID: string | null;
  features: string[];
  createdAt: string;
  joinedAt: string | null;
}

// Ticket Types
export interface Ticket {
  id: number;
  user_id: string;
  username: string;
  reason: string;
  status: "open" | "closed";
  channel_id: string | null;
  guild_id: string;
  category_id: number | null;
  created_at: string;
  closed_at: string | null;
}

// Feature Types
export interface Feature {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
}

// Notification Types
export interface NotificationSettings {
  guildId: string;
  enabled: boolean;
  channelId: string | null;
  events: NotificationEvent[];
  webhookUrl: string | null;
  mentionRoles: string[];
  mentionUsers: string[];
}

export interface NotificationEvent {
  type: string;
  enabled: boolean;
  customMessage: string | null;
}

export interface NotificationTestResult {
  success: boolean;
  message: string;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
