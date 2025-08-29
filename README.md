# Discord Dashboard - React Frontend

🎛️ Modernes React Dashboard für den Discord Bot mit TypeScript und Vite.

## 🚀 Features

- **React 18**: Moderne React-Hooks und Komponenten
- **TypeScript**: Type-Safe Development
- **Vite**: Blitzschnelle Entwicklung und Builds
- **Material-UI**: Schöne UI-Komponenten
- **Responsive Design**: Funktioniert auf allen Geräten
- **Live Data**: Echtzeitdaten vom Bot
- **API Integration**: Vollständige Bot-Steuerung

## 🎯 Dashboard-Bereiche

- **📊 Statistics**: Bot- und Server-Statistiken
- **🎫 Tickets**: Ticket-Verwaltung
- **🤖 Auto Responses**: Automatische Antworten verwalten
- **🔗 Webhooks**: Webhook-Konfiguration
- **⚙️ Settings**: Bot-Einstellungen

## 📋 Voraussetzungen

- Node.js 20+
- Discord Bot API (läuft auf Port 3001)

## 🔧 Schnellstart

```bash
# Repository klonen
git clone https://github.com/yourusername/discord-dashboard.git
cd discord-dashboard

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Dashboard öffnen
open http://localhost:5173
```

## 🐳 Docker

```bash
# Image bauen und starten
docker build -t discord-dashboard .
docker run -d --name discord-dashboard -p 3000:80 discord-dashboard
```

## 🔧 Konfiguration

### API-Verbindung

Das Dashboard verbindet sich automatisch mit der Bot-API:

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api';
```

### Umgebungsvariablen

Erstelle eine `.env` Datei:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=Discord Bot Dashboard
```

## 🛠️ Entwicklung

### Scripts
```bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run preview      # Build vorschau
npm run lint         # ESLint prüfen
npm run type-check   # TypeScript prüfen
```

## 🤝 Related Projects

- **Discord Bot**: [discord-bot](https://github.com/yourusername/discord-bot)
- **Documentation**: [discord-bot-docs](https://github.com/yourusername/discord-bot-docs)

## 📚 Dokumentation

Vollständige Dokumentation: [Discord Bot Docs](https://yourusername.github.io/discord-bot-docs)

## 📄 Lizenz

MIT License
