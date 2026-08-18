---
title: TeamGrid Developer – deutscher Einstieg
description: Der kompakte deutsche Einstieg in API v1, TypeScript SDK, CLI, Browser-Login, MCP und sichere Produktivintegrationen.
owner: Developer Experience
reviewedAt: 2026-08-10
---

Die vollständige Referenz bleibt auf Englisch, damit Methodennamen, Fehlermeldungen und technische
Begriffe exakt mit den veröffentlichten Paketen übereinstimmen. Diese Seite führt deutschsprachige
Teams durch den empfohlenen Einstieg.

## Oberfläche auswählen

| Anwendungsfall | Empfohlene Oberfläche |
| --- | --- |
| Produktivdienst in einer beliebigen Sprache | [API v1](/api/v1/) |
| Node.js- oder TypeScript-Dienst | [TypeScript SDK](/sdk/) |
| Terminal, Skripte oder CI | [CLI](/cli/) |
| Überwachte Lesezugriffe aus einem vertrauenswürdigen AI-Host | [MCP-Server](/mcp/) |
| Bestehende Integration mit API v0 | [Migration zu API v1](/api/v0/migration/) |

## Empfohlener Einstieg

1. Entscheide, ob die Integration einer Person oder einem dauerhaft betriebenen Dienst gehört.
2. Nutze für lokale Entwicklung einen Personal Token und für produktive Prozesse einen Service
   Account.
3. Vergib nur die wirklich benötigten Scopes. Die [Scope-Rezepte](/guides/scope-recipes/) geben
   sichere Ausgangspunkte vor.
4. Prüfe mit `GET /workspace`, ob Token, Region und Workspace zusammenpassen.
5. Implementiere begrenzte Timeouts, Pagination, Wiederholungen, Idempotency Keys und `If-Match`,
   bevor die Integration Kundendaten verändert.
6. Arbeite vor dem Start die [Production-Go-live-Checkliste](/guides/production-go-live/) ab.

## CLI und Browser-Login

```bash
npm install --global @teamgrid/cli@1.1.0
teamgrid auth login
teamgrid auth status --check
teamgrid workspace
```

Der Browser-Login nutzt eine lokale Loopback-Verbindung und speichert den Token im
Betriebssystem-Schlüsselbund. `--no-browser` ist kein Device Flow. Für CI und Server darf kein
interaktiver Browser-Login verwendet werden; dort gehört ein Service-Account-Token in einen Secret
Manager. Alle Einzelheiten stehen unter [CLI Browser Login](/cli/browser-login/).

## Hilfe und Sicherheit

Übermittle an den Support nur Statuscode, stabilen Fehlercode, Request-ID, Zeitpunkt und Region.
Teile niemals Token, Browser-Freigabe-URL, PKCE-Werte, Webhook-Secrets, Upload- oder
Download-Intents, Umgebungsvariablen oder ungeschwärzte Kundendaten.

Nutze bei Fehlern die [Troubleshooting-Anleitung](/resources/troubleshooting/) und prüfe den
[TeamGrid-Status](https://status.teamgrid.app/).
