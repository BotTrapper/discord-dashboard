export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export const AVAILABLE_PERMISSIONS = [
  {
    id: "dashboard.view",
    label: "Dashboard anzeigen",
    description: "Kann das Dashboard öffnen",
  },
  {
    id: "dashboard.admin",
    label: "Dashboard verwalten",
    description: "Vollzugriff auf Dashboard",
  },
  {
    id: "tickets.view",
    label: "Tickets anzeigen",
    description: "Kann Tickets einsehen",
  },
  {
    id: "tickets.manage",
    label: "Tickets verwalten",
    description: "Kann Tickets bearbeiten",
  },
  {
    id: "tickets.add_users",
    label: "User zu Tickets hinzufügen",
    description: "Kann User hinzufügen",
  },
  {
    id: "tickets.remove_users",
    label: "User aus Tickets entfernen",
    description: "Kann User entfernen",
  },
  {
    id: "autoresponse.view",
    label: "Auto-Responses anzeigen",
    description: "Kann Auto-Responses einsehen",
  },
  {
    id: "autoresponse.manage",
    label: "Auto-Responses verwalten",
    description: "Kann Auto-Responses bearbeiten",
  },
] as const;

export const ADMIN_LEVELS = {
  STANDARD: 1,
  SENIOR: 2,
  SUPER: 3,
} as const;
