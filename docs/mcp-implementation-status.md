# MCP: Umsetzung der beiden Prüfungen

Stand: 29. September 2026. Kandidatenstand, keine Production-Freigabe.
Die öffentliche Paketversion bleibt 1.2.1. Die folgenden Änderungen sind in
den bestehenden Review-Branches umgesetzt; Live-Abnahme und Veröffentlichung
sind ausdrücklich getrennte Schritte.

## Bereits umgesetzt und lokal geprüft

- SDK-Frist und Abbruchsignal gelten bis zum vollständig gelesenen JSON-Body,
  einschließlich Wiederholungen. Lange `Retry-After`-Werte bleiben erhalten;
  überschreiten sie das Zeitbudget, wird kein verfrühter Retry gestartet.
- MCP-Aufrufe erhalten isolierte Abbruchsignale und eine eigene Request-ID.
  HTTP-Zulassung, Tokenprüfung und Delegation sind ebenfalls zeitlich begrenzt.
- Die Eingabeschemas werden als Draft 2020-12 geprüft. Feldabhängigkeiten wie
  `descriptionFormat`/`description` werden tatsächlich durchgesetzt.
- Dokumente werden in höchstens 16.384 UTF-16-Codeeinheiten gelesen. Fortsetzungen
  sind an dieselbe Revision gebunden. Mutationen liefern kleine Quittungen.
- Zusätzliche Rechte werden anhand konkreter Eingaben geprüft, unter anderem
  Finanzfelder, personenbezogene Mitgliederdaten und Zieltypen der Suche.
- Fachprofile besitzen gemeinsame Workspace-, Benutzer-, Aufgaben- und Projekt-
  Lookups. Bedingte Schreibwerkzeuge verwenden durchgehend starke, zitierte ETags.
- Workspace-Kontext enthält die geprüfte handelnde Identität und gegebenenfalls
  deren Profilzeitzone. Service-Principals erhalten keine erfundene Person.
- Top-N-Suchergebnisse sind ausdrücklich unvollständig. Die API liefert die neue
  Metadatenprojektion nur bei Opt-in, damit ältere strikte SDKs kompatibel bleiben.
- `PATCH /comments/{id}` sowie SDK, CLI und MCP erlauben berechtigte Korrekturen.
  Aktuelle Zielrechte, CAS und Erwähnungen werden geprüft; Anhänge, Reaktionen
  und Bearbeitungshistorie bleiben erhalten. Bearbeitung sendet keine neuen
  Kommentarbenachrichtigungen.
- Der neue Vertrag umfasst 238 API-Operationen und 208 MCP-Werkzeuge
  (84 Lese- und 124 Schreibwerkzeuge). Die App verwendet Policy V8/Resolver V15;
  alte freigegebene Vertragsidentitäten bleiben für die Übergangsphase erhalten.

Quellstände dieses geprüften Blocks:

| Komponente | Commit | Prüfung |
| --- | --- | --- |
| API | `843a292` | 453 Tests bestanden |
| App | `4e99df9a4` | 1.132 Developer-Platform-Tests bestanden; neue Fachdateien lint-frei |
| SDK/CLI/MCP | `8ad5924` plus laufende Discovery-Korrektur | 458 Tests bestanden im korrigierten Arbeitsstand; Build, Typen und 238 Oberflächen geprüft |

Der erste SDK-Push dieses Blocks enthielt noch eine widersprüchliche Testassertion
zur Sensitivität des Recurrence-Leserechts. Sie wurde im Arbeitsstand korrigiert;
CI-Erfolg wird erst nach dem erneuten Push als Nachweis eingetragen.

## Noch laufende Arbeiten

1. Begrenzte, deterministisch paginierte Tool-Discovery und präzise Ausgabeschemas.
2. Qualifizierte zusätzliche Authentifizierung für sensible Login-Presets.
   `mcp-context` und `mcp-work` beschreiben jetzt den vollständigen Rechtebedarf;
   Browser-Ausstellung bleibt bis zum Step-up-Nachweis dafür gesperrt.
3. Ein echter regionaler OAuth-Provider mit Discovery, PKCE, Consent, Rotation,
   Widerruf, delegierten API-Credentials und Verbindungsverwaltung. Der bisherige
   CLI-Codeaustausch und der HTTP-MCP-Adapter allein erfüllen das nicht.
4. Geschützte Datei-/Exportübergänge, klare Teil-/Unklar-Ergebnisse und Wiederaufnahme.
5. Live-CAS, Schreib-, Isolations-, Widerrufs- und Host-Abnahme der W01–W20-Matrix.
6. Paketversionierung, unabhängige Reviews, koordinierte Veröffentlichung und
   anschließende Aktualisierung der öffentlichen Verfügbarkeitsangaben.

Die [erste Prüfung](./mcp-product-readiness.md) und die
[Vollständigkeitsmatrix](./mcp-completeness-audit.md) bleiben die Basis der Abnahme.
Keine lokale Testzahl ersetzt eine fehlende Live- oder Host-Qualifikation.
