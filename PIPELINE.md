# 🚀 Discord Dashboard CI/CD Pipeline

Diese automatische Pipeline buildet und published das Discord Dashboard Frontend als public Docker Image mit Vite Preview Server.

## 📋 Features

- **Automatische Builds** für `main` und `dev` Branches
- **Multi-Architecture Support** (AMD64 + ARM64)
- **Public Docker Registry** (GitHub Container Registry)
- **Optimized Caching** für schnellere Builds
- **Vite Preview Server** für optimale Performance
- **Einfache Integration** in bestehende Nginx-Infrastruktur

## 🔄 Wann wird die Pipeline ausgelöst?

- **Push** auf `main` oder `dev` Branch (nur bei Änderungen im `discord-dashboard/` Ordner)
- **Pull Requests** gegen `main` oder `dev`
- **Manuelle Ausführung** über GitHub Actions UI

## 📦 Verfügbare Images

Nach erfolgreichem Build sind folgende Images verfügbar:

```bash
# Latest (nur für main branch)
ghcr.io/bottrapper/discord-dashboard:latest

# Branch-spezifische Tags
ghcr.io/bottrapper/discord-dashboard:main
ghcr.io/bottrapper/discord-dashboard:dev

# Commit-spezifische Tags (für Rollbacks)
ghcr.io/bottrapper/discord-dashboard:main-<commit-sha>
ghcr.io/bottrapper/discord-dashboard:dev-<commit-sha>
```

## 🐳 Docker Image verwenden

```bash
# Image pullen
docker pull ghcr.io/bottrapper/discord-dashboard:latest

# Container starten (Vite Server auf Port 4173)
docker run -d \
  --name discord-dashboard \
  -p 4173:4173 \
  ghcr.io/bottrapper/discord-dashboard:latest

# Mit Environment Variables
docker run -d \
  --name discord-dashboard \
  -p 4173:4173 \
  -e VITE_API_URL=http://localhost:3001 \
  ghcr.io/bottrapper/discord-dashboard:latest
```

## 🔧 Docker Compose

```yaml
version: '3.8'
services:
  dashboard:
    image: ghcr.io/bottrapper/discord-dashboard:latest
    ports:
      - "4173:4173"
    environment:
      - VITE_API_URL=http://localhost:3001
    restart: unless-stopped
    
  # Integration mit bestehendem Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - dashboard
```

## 🌐 Nginx Integration

Da du bereits Nginx verwendest, kannst du das Dashboard einfach als Upstream integrieren:

```nginx
upstream dashboard {
    server dashboard:4173;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://dashboard;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🏗️ Image Features

- **Vite Preview Server** - Optimierte Production Builds
- **Node.js 20 Alpine** - Minimal und sicher
- **Hot Reload Support** - Für Development (falls gewünscht)
- **Environment Variables** - Für flexible Konfiguration
- **Multi-Architecture** - AMD64 und ARM64 Support

## 🔍 Monitoring & Debugging

```bash
# Container Logs anzeigen
docker logs discord-dashboard

# Container Shell (für Debugging)
docker exec -it discord-dashboard sh

# Vite Server direkt testen
curl http://localhost:4173

# Mit Health Check über Nginx
curl http://localhost/health
```

## 🚀 Deployment Strategien

### Development
```bash
# Dev Branch verwenden
docker pull ghcr.io/bottrapper/discord-dashboard:dev
docker run -p 4173:4173 ghcr.io/bottrapper/discord-dashboard:dev
```

### Production
```bash
# Latest stable verwenden
docker pull ghcr.io/bottrapper/discord-dashboard:latest
docker run -p 4173:4173 ghcr.io/bottrapper/discord-dashboard:latest
```

### Mit bestehender Infrastruktur
```bash
# In docker-compose.yml integrieren
version: '3.8'
services:
  dashboard:
    image: ghcr.io/bottrapper/discord-dashboard:latest
    ports:
      - "4173:4173"
    networks:
      - app-network

networks:
  app-network:
    external: true
```

## ⚙️ Pipeline Konfiguration

Die Pipeline verwendet:
- **Node.js 20 Alpine** für optimale Performance
- **Vite Preview Server** statt Nginx
- **GitHub Container Registry** als Registry
- **Docker Buildx** für Multi-Architecture Builds
- **GitHub Actions Cache** für schnellere Builds

## 🔐 Permissions

Das Image wird automatisch als **public package** veröffentlicht:

```bash
# Kein Login erforderlich
docker pull ghcr.io/bottrapper/discord-dashboard:latest
```

## 🎯 Vorteile des Vite Servers

- **Einfacher** - Nur ein Service, keine komplexe Nginx-Konfiguration
- **Leichtgewichtig** - Kleineres Image ohne zusätzliche Services
- **Integrierbar** - Funktioniert perfekt mit bestehendem Nginx als Reverse Proxy
- **Entwicklerfreundlich** - Gleiche Technologie wie im Development
