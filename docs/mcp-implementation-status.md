# MCP: Umsetzung der beiden Prüfungen

Stand: 29. September 2026. Paketkandidat 1.2.2; keine Production-Freigabe.
Die öffentlich veröffentlichte Paketversion bleibt 1.2.1. Implementierung,
lokale Prüfungen, Host-Abnahme und Veröffentlichung sind getrennte Nachweise.

## Im Kandidaten implementiert

- Durchgängige SDK-Fristen und Abbruchsignale einschließlich Antwort-Body und
  Wiederholungen; `Retry-After` wird nicht verkürzt.
- Isolierte MCP-Anfragen, begrenzte HTTP-Bodies und Parallelität, paginierte
  Tool-Discovery, Draft-2020-12-Eingaben und genaue geprüfte Ausgabeschemas.
- Kleine Mutationsquittungen, revisionsgebundene Dokumentabschnitte und klare
  Ergebnisse: angenommen, abgeschlossen, teilweise, fehlgeschlagen oder unklar.
  Asynchrone Antworten enthalten ein Statuswerkzeug und eine beständige Ziel-ID.
- Minimale initiale OAuth-Rechte; eingabeabhängige Zusatzrechte und geschlossene
  API-Challenges für die Rechte am Ziel eines Kommentars oder Exports. Rollen,
  Freigaben und Workspace-Sperren lösen keine automatische Rechteausweitung aus.
- Vollständige Login-Presets mit zusätzlicher Passkey-Bestätigung für sensible
  Rechte. Bestätigungen sind an Person, Sitzung, Workspace, Client, Rechte und
  konkreten Antrag gebunden; lokale und authentifizierte Cross-Cell-Verbindungen
  besitzen getrennte, einmalige Bestätigungswege.
- Zentrale Anmeldung mit bestehendem einmaligem Workspace-Handoff zur zuständigen
  Region; Region/Zelle bleiben serverseitig an den gespeicherten Antrag gebunden.
- Regionaler OAuth-Provider: Discovery, Authorization Code mit PKCE S256,
  expliziter Consent, kurze Access Tokens, rotierende Refresh Tokens,
  Wiederverwendungserkennung und Widerruf einer ganzen Verbindung.
- Öffentliche Clients und registrierte vertrauliche Clients mit gehashten,
  rotierbaren Secrets (`client_secret_basic`/`client_secret_post`). Optionale
  Client-Metadaten-Dokumente erfordern ausdrücklich erlaubte HTTPS-Domains,
  öffentliche geprüfte und fest gebundene DNS-Adressen sowie Zeit-/Größenlimits.
- Eigene API-Delegation mit anderer Audience und anderem Tokenformat. App/API
  prüfen aktuelle Verbindung, Person, Mitgliedschaft und bestehende Fachrechte.
  Autorisierungsausfälle führen zu 503, widerrufene Zugänge zu einer Ablehnung.
- Reaktive Verwaltung eigener OAuth-Verbindungen mit Client, Workspace-Namen, Rechten,
  Ablauf und Widerruf; Workspace-Wechsel öffnet die Verwaltung in der zuständigen
  Region. Keine Tokenwerte werden veröffentlicht.
- Private Datei-/Export-Ressourcen über `resources/read`, begrenzt auf 1 MiB.
  Jede Anfrage autorisiert neu; Transfer-URLs bleiben intern. Dateien können
  außerdem über `teamgrid files download ID --file PATH` bis 50 MiB sicher in
  eine neue lokale Datei geschrieben werden. Größere Inhalte werden ausdrücklich
  abgelehnt; Metadaten sind keine Behauptung einer vollständigen Inhaltsübertragung.
- Benutzer-/Zeitzonenkontext, explizit unvollständige Top-N-Suche und berechtigte
  Kommentarkorrekturen mit CAS, erhaltenen Anhängen/Reaktionen und ohne erneute
  Kommentarbenachrichtigung.
- Gehosteter Node-Einstieg mit getrennten Liveness-/Readiness-Prüfungen, sicheren
  Anfrage-IDs für MCP/API/Provider und einem Container ohne Root-Schreibrechte.
  Die CI baut und prüft das Image; nur geschütztes `main` kann es veröffentlichen.

Alle 79 JSON-Anfragebeispiele und 239 erfolgreichen JSON-Antwortbeispiele werden
jetzt gegen die API-Schemas validiert. Der Generator berücksichtigt verschachtelte
und bedingte Schemas; ungültige Beispiele blockieren die API-CI.

Der Fachvertrag umfasst **238 API-Operationen und 208 MCP-Werkzeuge**
(84 Lese- und 124 Schreibwerkzeuge). Die zusätzlichen privaten Ressourcen sind
keine neuen Fachoperationen. App-Kandidat: Policy V8 und Resolver V16.
Bestehende freigegebene Vertragsidentitäten bleiben während des Übergangs erhalten.

## Nachweise dieser Umsetzung

Die folgenden Prüfungen beziehen sich auf Review-Arbeitsstände und die genannten
CI-Commits, nicht auf einen veröffentlichten Paket- oder Production-Stand:

| Bereich | Letzter abgeschlossener Nachweis |
| --- | --- |
| App | 1.252 Developer-Platform-/Architekturtests; anschließend 59 OAuth-/Login-Tests; 9 Verbindungs-/Navigationsprüfungen |
| App-Typen/Lint | 766/769 Typdiagnosen und 4.836/4.862 Lintfehler innerhalb der bestehenden Baselines; keine Baseline erhöht |
| Echte MongoDB-Transaktionen | Isolierter MongoDB-8.3.8-Container: Code-/Refresh-Rennen, dauerhafter Widerruf, falscher Client, Audit-Rollback, einmaliger Consent und atomare CLI-Freigabe |
| API | 456 Tests sowie Lint erfolgreich |
| MCP-Dateien/Scopes/Betrieb | Gezielte Tests für private Ressourcen, begrenzte Übertragung, Nachfreigaben, Gateway, Readiness und Node-HTTP erfolgreich |
| Container | Lokal gebaut; Smoke mit synthetischer Konfiguration: Benutzer `node`, schreibgeschütztes Dateisystem, Liveness erfolgreich, deaktivierter Zugang bleibt geschlossen |
| Dokumentation | 739 Seiten gebaut; Vertrags-, Inhalts- und HTML-Prüfungen sowie zehn Function-Tests erfolgreich; 25 Browserprüfungen erfolgreich, ein auf Mobilgeräten nicht anwendbarer Desktop-Test übersprungen; neue Vergleichsbilder visuell geprüft |
| SDK-Gesamtprüfung | 695 Tests sowie Typen, Vertragsdrift, Paketbau, Produktionsabhängigkeitsaudit, Redaction und Installation aus gepackten Paketen erfolgreich; alle sechs OS-/Node-CI-Kombinationen und Container-CI am SDK-Commit `ccf18032d309725f8503a13461e62a15ff11faca` erfolgreich |

## Noch vor einer vollständigen Freigabe abzuschließen

1. Die implementierte zentrale Anmeldung mit einmaligem Workspace-Handoff und die Passkey-Bestätigung am exakten App-Kandidaten
   live prüfen, insbesondere zentrale Anmeldung mit einem Workspace in einer
   anderen Zelle. Bestehende Cross-Cell-Primitivtests ersetzen diesen Browserweg nicht.
2. Gehostetes Routing und Konfiguration über die gültige Release-Pipeline
   integrieren; nur nach der Abnahme OAuth/MCP-Schreibgates aktivieren.
3. Datei-Uploads bleiben beim bestehenden App-/CLI-/SDK-Transferweg. Die privaten
   MCP-Ressourcen liefern Downloads; sie stellen keinen beliebigen Upload- oder
   lokalen Dateisystemzugriff bereit. Den vollständigen Übergabeablauf abnehmen.
4. Live-CAS, Konflikt-/Wiederaufnahmeszenarien, Rechteentzug, gesperrte/fremde
   Workspaces, Last und reale Clients gemäß W01–W20 an den endgültigen SHAs prüfen.
5. Unabhängige Reviews für SDK und Dokumentation, gemeinsame
   Veröffentlichung und Prüfung der tatsächlichen Verfügbarkeit in DE/US.

Die [erste Prüfung](./mcp-product-readiness.md) und die
[Vollständigkeitsmatrix](./mcp-completeness-audit.md) bleiben die Abnahmebasis.
Keine lokale Testzahl ersetzt einen fehlenden Live- oder Host-Nachweis.
