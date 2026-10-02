---
title: TeamGrid Developer – deutscher Einstieg
description: Der kompakte deutsche Einstieg in API v1, TypeScript SDK, CLI, Browser-Login, MCP und sichere Produktivintegrationen.
owner: Developer Experience
reviewedAt: 2026-10-02
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
| Überwachte Lese- und bestätigte Schreibzugriffe aus einem vertrauenswürdigen AI-Host | [MCP-Server](/mcp/) |
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
npm install --global @teamgrid/cli@1.2.2
teamgrid auth login
teamgrid auth status --check
teamgrid workspace
```

Browser-Login ist in Production DE und US aktiviert. Melde dich mit deinem
TeamGrid-Konto an, wähle den Workspace und bestätige die angeforderten Scopes.
Sensible Rechte benötigen deinen Passkey. Alternativ bleibt der manuelle Import
über `teamgrid auth login --manual` und die verdeckte Terminal-Eingabe verfügbar.

Der Browser-Login nutzt eine lokale Loopback-Verbindung und speichert den Token im
Betriebssystem-Schlüsselbund. `--no-browser` ist kein Device Flow. Für CI und Server darf kein
interaktiver Browser-Login verwendet werden; dort gehört ein Service-Account-Token in einen Secret
Manager. Alle Einzelheiten stehen unter [CLI Browser Login](/cli/browser-login/).

## MCP mit ChatGPT

Für ChatGPT brauchst du keine lokale Installation. Nutze OAuth und den Endpoint
für die Region, die deinen Workspace betreibt:

- DE: `https://mcp-de.teamgrid.app/mcp`
- US: `https://mcp-us.teamgrid.app/mcp`

Die [ChatGPT-Anleitung](/mcp/chatgpt/) erklärt Einrichtung, Workspace-Auswahl,
Freigabe, Passkey und Trennen. Production bietet **208 Tools: 84 Lese- und
124 Schreiboperationen**. Deine Workspace-Rolle und bestätigten Scopes gelten
weiterhin bei jedem Aufruf. Die vollständige Tool-Liste ist keine pauschale
Schreibberechtigung.

Für Änderungen folge der [Schreibanleitung](/mcp/write-workflow/): Ziel lesen,
Workspace und Änderung bestätigen, den exakten ETag verwenden und das Ergebnis
prüfen. Lokal bleiben `core` und `all` reine Leseprofile; Schreibprofile werden
explizit gewählt. Dateien, Exporte und große Dokumente stehen unter
[Ressourcen und Protokoll](/mcp/resources-and-protocol/).

## Hilfe und Sicherheit

Übermittle an den Support nur Statuscode, stabilen Fehlercode, Request-ID, Zeitpunkt und Region.
Teile niemals Token, Browser-Freigabe-URL, PKCE-Werte, Webhook-Secrets, Upload- oder
Download-Intents, Umgebungsvariablen oder ungeschwärzte Kundendaten.

Nutze bei Fehlern die [Troubleshooting-Anleitung](/resources/troubleshooting/) und prüfe den
[TeamGrid-Status](https://status.teamgrid.app/).
