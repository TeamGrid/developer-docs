# MCP: Vollständigkeit von Nutzerabläufen und Freigabekriterien

Stand: 29. September 2026. Zweite vertiefte Prüfung; Analyse, keine Freigabe.

## Entscheidung

Die erste Prüfung erfasst wesentliche Lücken, aber noch nicht alle Anforderungen an
eine runde Kundenlösung. Die zweite Prüfung ergänzt drei reproduzierte Laufzeitfehler
und mehrere fachliche Anforderungen. Die bestehenden 207 Werkzeuge bleiben eine breite
Grundlage; ihr Umfang beschreibt die bewertete öffentliche API, nicht alle App-Funktionen.

Die bisherigen Befunde und der OAuth-Stand gelten weiter:
[Umsetzungsstand und erste Prüfung](./mcp-product-readiness.md).
Zusätzliche Features und nachgewiesene Fehler sind unten ausdrücklich unterschieden.

### Geprüfte Quellen

| Komponente | Quellstand |
| --- | --- |
| SDK / CLI / MCP | `1027e57a92c2e88ba8997e6edffdf8a0733c4b99` |
| API | `285125350dcbd2f725643eb216fe412c8caff7a4` |
| App | `67ecef07174fd5b55d234316b0d551539a76e22f` |
| Readiness-Dokumentation vor dieser Ergänzung | `cbe731c707506ad9142df11868141076b163c476` |

Die vorangegangene Dokumentations-CI
[36562567831](https://github.com/TeamGrid/developer-docs/actions/runs/36562567831)
ist erfolgreich. Die 74 MCP-Tests stammen aus dem unmittelbar vorangegangenen Audit
am unveränderten Quellstand. In dieser Runde wurden gezielte zusätzliche lokale
Proben mit synthetischen Credentials und Antworten ausgeführt. Kein Netzwerkzugriff
mit diesen Credentials, keine Kundendatenänderung, keine Production-Änderung.

## 1. Zusätzlich reproduzierte Fehler

### A. Schema-Dialekt stimmt nicht mit den Regeln überein – P2

`packages/mcp-server/src/domainTools.ts:50` verwendet die Standard-Ajv-Klasse mit
`strict: false`. Die lokale Probe bestätigt Draft 7. Die generierten Eingabeschemas
verwenden jedoch `dependentRequired`, das erst mit Draft 2019-09 eingeführt wurde.
Ohne `$schema` ist im aktuellen MCP-Protokoll Draft 2020-12 maßgeblich.
[Ajv-Dokumentation](https://ajv.js.org/json-schema.html),
[MCP-Toolschemas](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

**Reproduktion:** `descriptionFormat: "markdown-v1"` ohne `description` wird bei
`teamgrid_task_create`, `teamgrid_task_update` und `teamgrid_tasks_bulk_update`
vom MCP-Validator akzeptiert, obwohl das veröffentlichte Schema die Beschreibung
verlangt. Das beweist eine Lücke in der MCP-Validierung, keinen Rechtebypass im Backend.

**Änderung:** Einen zum deklarierten Schema passenden Validator einsetzen; unbekannte
Validierungs-Schlüsselwörter beim Generieren/Prüfen erkennen. Positive und negative
Feldabhängigkeiten sowie rekursive Schemas über den tatsächlichen MCP-Aufruf testen.
Es ist keine allgemeine Abhängigkeitsmigration nötig.

### B. SDK-Zeitlimit endet vor dem Lesen des Antwortkörpers – P1

In `packages/api-client/src/client.ts`, Methode `#request` ab Zeile 4162, räumt
`combined.cleanup()` im `finally` direkt nach `fetch()` den Timer und die Bindung an
das externe Abbruchsignal auf. `parseJsonResponse()` liest den Body erst danach.

**Reproduktion:** Antwort-Header sofort, Body zunächst offen, SDK-Timeout 25 ms.
Nach 150 ms bleibt der Aufruf offen und das Fetch-Signal unabgebrochen. Auch ein
anschließender Abbruch durch den Aufrufer erreicht das Body-Signal nicht. Erst das
explizite Fertigstellen der synthetischen Antwort beendet den Aufruf erfolgreich.

Das ergänzt den vorher gefundenen fehlenden Signaltransport vom MCP zum SDK:
Beide Ebenen müssen korrigiert werden, sonst bleibt die Durchgängigkeit unvollständig.

**Änderung:** Frist und Signal bis zum vollständigen Lesen/Validieren bzw. Abbruch
halten; Ressourcen in jedem Ausgang freigeben. Test mit verzögerten Headers, verzögertem
Body, nie endendem Body, Größenüberschreitung und Abbruch nach den Headers.

### C. Serverseitige Warteempfehlung wird verkürzt – P2

`client.ts:322` begrenzt `Retry-After` auf 30 Sekunden; die MCP-Fehlerprojektion
begrenzt den Wert ebenfalls. Die lokale Probe liefert 429 mit `Retry-After: 120`.
Der SDK verlangt vom injizierten Sleep nur 30.000 ms und startet dann die zweite
Anfrage. Die Wartezeit wurde in der Probe simuliert, nicht tatsächlich abgewartet.

**Änderung:** Die vom Server gewünschte Wartezeit unverändert erhalten. Wenn sie das
lokale Zeitbudget überschreitet, einen nachvollziehbaren Fehler mit Wiederaufnahmezeit
zurückgeben. Eigenes Backoff kann begrenzt werden; die Grenze darf die Serverempfehlung
nicht stillschweigend ersetzen. [HTTP Retry-After](https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after).

## 2. Zusätzlich bestätigte fachliche Lücken

### D. Eindeutiger Benutzer- und Zeitkontext – P2

`workspace_get` liefert Workspace, Name, Region, Zelle, Währung und Subdomain.
Es liefert weder die aktuell handelnde Person noch deren Zeitzone. `users_list`
zeigt Benutzer, kennzeichnet aber keinen davon als aktuellen Benutzer und enthält
keine Zeitzone. Auch `/auth/context` enthält derzeit keine Subject-User-ID und wird
bewusst nicht als MCP-Tool angeboten. Timeraktionen verlangen dagegen `userId`.

**Folge:** Für „meine Aufgaben“, „mein Timer“ oder „morgen um 9 Uhr“ fehlt dem MCP
ein verlässlicher eigener Kontext, sofern der Host/Nutzer ihn nicht separat liefert.
Eine Region wie DE oder US bestimmt weder die Person noch die individuelle Zeitzone.
Die App besitzt bereits ein Benutzerfeld `timezone` (`imports/models/Users/schema.js:223`).

**Ergänzung:** Eine kleine autorisierte Kontextprojektion mit Identitätsart,
gegebenenfalls Subject-User-ID und gültiger IANA-Zeitzone samt Herkunft. Workspace
und erlaubte Arbeitsbereiche transparent machen. Bei Service-Zugängen darf kein
menschliches „ich“ erfunden werden. Vorhandene geheime Credential-Diagnostik bleibt
außerhalb des Modellkontexts; kein pauschales Freigeben von `/auth/context`.

### E. Suchergebnisse sind keine vollständigen Datenbestände – P2

Die aktuelle Suche umfasst Kontakte, Projekte und Aufgaben, maximal 50 Ergebnisse,
ohne Cursor oder Vollständigkeitskennzeichen. Die App lädt höchstens 100 Kandidaten
je Typ, filtert sie auf aktuelle Sichtbarkeit und kürzt die zusammengeführte Liste.
Dadurch beweist auch eine kurze oder leere Liste nicht, dass keine weiteren sichtbaren
Treffer existieren. Ein Suchindex kann außerdem der gerade erfolgten Mutation nachlaufen.

Quellen: API `src/v1/router.js:2548`; App
`imports/system/developerPlatform/searchExportRuntime.ts:289` und
`searchExportOperations.ts:360`; MCP-Schema `teamgrid_search`.

**Ergänzung:** Ergebnismenge als begrenzte Suche kenntlich machen, bei Bedarf
Fortsetzung anbieten und Zugriffsschutz bei jedem Folgeschritt neu prüfen.
Mehrdeutige Namen dürfen keine automatische Schreibzielauswahl erzwingen.
Zum Prüfen einer gerade geschriebenen Ressource deren zurückgelieferte ID direkt
lesen. Dokumente/Dateien/Notizen brauchen einen geeigneten Such- oder Filterweg,
wenn ein solcher Nutzerablauf angeboten wird.

Große Auswertungen benötigen ebenfalls einen vollständigen, begrenzten Lesepfad.
Die API enthält aktuell keine Aggregate-/Report-Endpunkte. Korrekte Summen sind
über geeignete vollständige Pagination möglich; für große Workspaces sind kuratierte
serverseitige Auswertungen eine sinnvolle spätere Ergänzung. Eine einzelne Seite
oder Top-N-Suche darf nie als Gesamtsumme ausgegeben werden.

### F. Bestehende Kommentare bearbeiten – P2, fachliche Erweiterung

Die App besitzt `teamgrid/comments/update`, verwendet durch
`imports/ui-next/tasks/details/commands/taskDetailsCommands.ts:183`.
Die öffentliche Route `/comments/{id}` bietet ausschließlich GET und DELETE;
ein Update-Tool fehlt entsprechend. Die interne API-Testdatei prüft die bisherige
Abwesenheit dieses Updates sogar explizit.

**Ergänzung:** Eigene Kommentare korrigieren als öffentlichen Fachvertrag ergänzen:
Eigentümer-/Rollenregeln, Version, Inhaltsformat, Audit und Verhalten von Erwähnungen
festlegen, dann API, SDK, CLI und MCP konsistent erweitern. Das ist eine additive
API-Funktion und lässt sich nicht allein durch Registrierung eines MCP-Tools erledigen.

**Präzisierung zu Gesprächsnotizen:** Auch dort fehlt ein öffentlicher Update-Weg.
Die bestehende App-Komponente `imports/components/CallNotes/Entry.js` zeigt gespeicherte
Notizen jedoch ausdrücklich `readOnly`. Eine Notizbearbeitung wäre eine gesonderte
Produktentscheidung; sie ist kein belegter Verlust einer vorhandenen App-Funktion.

## 3. Produktverträge, die vor einer vollständigen Freigabe feststehen müssen

Diese Punkte konkretisieren vorhandene offene Arbeiten; sie sind keine zusätzlich
reproduzierten Codefehler.

1. **Verbindungsverwaltung:** Nutzer erkennt Client, Workspace, Rechte, Ablauf und
   Status einer Verbindung; erneute Anmeldung und Trennen sind eindeutig. OAuth-
   Grant, delegierter API-Zugang und alle aktiven Prozesse müssen beim Widerruf
   konsistent reagieren. Bestehende Credential-Verwaltung dafür wiederverwenden.
2. **Unklare und teilweise Ergebnisse:** Einheitliche Unterscheidung zwischen
   abgewiesen, angenommen/laufend, abgeschlossen, teilweise abgeschlossen und
   unbekanntem Commit. Asynchrone Statuswerkzeuge und Bulk-Einzelergebnisse sind
   bereits vorhanden; Wiederaufnahme nach Host-Neustart, verlorener Antwort und
   abgelaufenem Statusdatensatz ist noch zu qualifizieren. Keine globale atomare
   Transaktion über mehrere unabhängige Tools behaupten.
3. **Dateien und Exporte:** Privaten Inhalt lesen bzw. Ergebnis tatsächlich erhalten
   können; geschützte Übergabe an App/Download oder qualifizierte begrenzte Übertragung.
   Secret- oder Token-URLs dürfen nicht versehentlich in Modellkontext/Logs gelangen.
4. **Sichtbare Wirkung:** Kleine eindeutige Erfolgsquittung, Ziel-ID/Revision und wo
   sinnvoll ein sicher erzeugter Link zum Objekt in TeamGrid. Einladungen, Kommentare,
   Webhooks und Automationen können andere Personen/Systeme betreffen; diese Wirkung
   muss im Werkzeug und im unterstützten Host erkennbar sein.
5. **Rechte und Freigaben:** Sensible Aktionen auf passende Profile/Scopes beschränken;
   Benutzerautorisierung und Host-Bestätigungen für diese Aktionen praktisch prüfen.
   Tool-Annotationen und Modellinstruktionen ersetzen keine serverseitigen Rechte.
6. **Betrieb:** Reale Limits nach Benutzer/Grant/Workspace, Last- und Ausfallprüfung,
   Aufräumen abgebrochener Arbeit, sichere Diagnose, messbare Widerrufszeit und
   nachvollziehbare API-/MCP-/OAuth-Korrelation. Versionierte Rollback-Wege und
   kompatible alte lokale Installationen erhalten.

Optionale MCP-Resources für große Inhalte und gezielte Arbeitsablauf-Prompts können
nützlich sein. Sampling, Roots, Apps, Elicitation, Tasks oder Subscriptions sind
keine pauschalen Pflichtfeatures. Snapshot-Abfragen müssen als solche erkennbar
bleiben; echte Live-Ansichten brauchen bei Einführung eine passende reaktive Quelle.

## 4. Gemeinsamer Abnahmekatalog

Die Szenarien verbinden bisherige und neue Befunde. „Offen“ bedeutet fehlender
Nachweis auf dem konkreten Release-Kandidaten; vorhandene Teiltests bleiben nutzbar.

| ID | Nutzerablauf | Fertig, wenn … | Aktueller Nachweis |
| --- | --- | --- | --- |
| W01 | Lokaler Einstieg | Installation, Schlüsselbund, passendes Login-/Toolprofil und erste Aktion funktionieren in den unterstützten Betriebssystemen. | macOS-Staging teilweise live; Presets/Restmatrix offen |
| W02 | Remote-OAuth | Echter Host führt Anmeldung, minimalen Consent, zusätzliche Rechte, Erneuerung und Widerruf erfolgreich aus. | Provider/Delegation offen |
| W03 | Verbindung verwalten | Zwei Clients/Workspaces sind unterscheidbar; Ersetzen, Trennen und Wiederverbinden betreffen genau die gewählte Verbindung. | Credential-Bausteine vorhanden; Remote-Abnahme offen |
| W04 | „Ich“ und lokale Zeit | Persönlicher Zugang, Service-Zugang, Zeitzone und Sommerzeit führen zu eindeutig richtigen Zielen/Zeitpunkten. | Kontextprojektion fehlt |
| W05 | Ziel finden | Gleichnamige Treffer werden unterscheidbar; begrenzte und leere Suche werden korrekt eingeordnet; direkte ID-Prüfung funktioniert. | Basissuche vorhanden; Vollständigkeitsvertrag offen |
| W06 | Aufgabe bearbeiten | Anlegen, Zuweisen, Termin, Beschreibung, Verschieben, Abschluss und Wiederöffnung respektieren Rechte, Format und aktuelle Revision. | Tools/Tests vorhanden; Live-CAS und neue Schema-Korrektur offen |
| W07 | Kommentar korrigieren | Lesen, Erstellen und zulässige Bearbeitung erhalten Inhalte und korrekte Erwähnungs-/Benachrichtigungswirkung. | Update-Fachvertrag fehlt |
| W08 | Zeit und Timer | Richtiger Nutzer/Aufgabe, paralleler Timerstart, Antwortverlust, Sperren und erneuter Stopp führen zu nachvollziehbaren Ergebnissen. | Tools vorhanden; Live-Szenarien offen |
| W09 | Planung und Kalender | Abwesenheiten, Termine, geplante Arbeit und Verfügbarkeit respektieren Zeitfenster, Zeitzone und delegierte Rechte. | Tools vorhanden; vollständige Live-Abnahme offen |
| W10 | Inhalte und Dateien | Große Dokumente sind begrenzt lesbar; Änderungen werden klar quittiert; Datei-/Exportergebnisse sind erreichbar. | Größenfehler und Transferübergang offen |
| W11 | Projekte und Vorlagen | Instanziierung/Lebenszyklus unterscheiden Annahme von Abschluss; Status bleibt nach Unterbrechung nachvollziehbar. | Operation-Tools vorhanden; Live-/Wiederaufnahmeprüfung offen |
| W12 | CRM, Kataloge und Custom Fields | Typen, Pflichtfelder, Beziehungen und konkurrierende Änderungen sind je Operationsklasse geprüft. | Breite Definitionen; Live-Abnahme offen |
| W13 | Finanzen | Zusatzrechte und Feldprojektionen stimmen; keine stille Null-/Teilbetragsinterpretation; Wiederholung ist sicher. | API-Rechte vorhanden; zusätzliche OAuth-Challenges/Live-Abnahme offen |
| W14 | Administration | Rollen, Einladungen, Gruppen und Freigaben wirken nur auf beabsichtigte Ziele; sensible Bestätigung und Audit sind geprüft. | Tools vorhanden; qualifizierter Zustimmungsweg/Live-Abnahme offen |
| W15 | Automationen und Integrationen | Änderung, Testauslösung, zukünftige Nebenwirkungen und Abbruch sind verständlich, begrenzt und nachvollziehbar. | Tools vorhanden; externe Wirkung/Live-Abnahme offen |
| W16 | Vollständige Auswertung | Alle erforderlichen Seiten werden verarbeitet oder die Grenze ausdrücklich gemeldet; Summen stimmen gegen eine Referenz. | Pagination vorhanden; Workflow-Abnahme offen |
| W17 | Konflikt und Unterbrechung | Parallele Änderung, Timeout vor/nach Commit, Bulk-Teilfehler und Host-Neustart erzeugen weder falschen Erfolg noch doppelte Absicht. | Teiltests vorhanden; Durchgängigkeit offen |
| W18 | Entzug und Isolation | Zwei Benutzer/Workspaces, Rollenänderung, Team-Sperre und DE-/US-Zuordnung bleiben während und zwischen Aufrufen korrekt. | API-/App-Bausteine und Teilbelege; Remote-/Schreibmatrix offen |
| W19 | Belastung und Inhaltssicherheit | Langsame Bodies, Rate-Limits, übergroße Antworten und manipulierte Toolinhalte bleiben begrenzt; keine Secrets oder fremden Ziele werden zugänglich. | Grenzprüfungen vorhanden; neue Fehler und Host-Evaluation offen |
| W20 | Release und Support | Paket/Vertrag/App/API/Zelle/Hostversion sind gebunden; Docs stimmen, Fehler sind diagnostizierbar und Rücknahme erhält den bisherigen Funktionsstand. | Pipeline-/Dokumentationsgates vorhanden; vollständiges Produktrelease offen |

### Freigaberegel

Für einen klar begrenzten Pilot müssen alle zu seinem Umfang gehörenden Szenarien
bestanden sein; andere Fähigkeiten bleiben ausdrücklich begrenzt. Für die beworbene
vollständige MCP-Lösung müssen alle 20 Szenarien und ihre nötigen Negativfälle am
veröffentlichten Paket in den zugesagten Hosts/Zellen nachgewiesen sein. Kein offener
P1-Befund, keine unklare Kundenanleitung und kein nur durch Toolzählung ersetzter Ablauf.

## 5. Reihenfolge

1. Die reproduzierten Fehler aus beiden Prüfungen beheben und gezielt absichern.
2. Kontext, Profile, Suche, Kommentaränderung und Ergebnis-/Dateiübergänge ergänzen.
3. Remote-OAuth mit regionaler Delegation und Verbindungsverwaltung fertigstellen.
4. Die W01–W20-Matrix für den gewählten Release-Umfang erfüllen; Restumfang sichtbar begrenzen.
5. Pakete, öffentliche Referenzen, Verfügbarkeit und Betriebsnachweise zusammen veröffentlichen.

Die öffentliche Dokumentation beschreibt weiterhin die tatsächlich veröffentlichten
Pakete. Für den Kandidaten müssen neben generierten Referenzen auch handgeschriebene
Aussagen wie „Export jobs … forbidden in every MCP profile“ beim Release aktualisiert
werden. Der Satz ist für die bisherigen öffentlichen Profile zutreffend, passt aber
nicht zu den neuen Kandidatenprofilen mit Export-Anlage und -Status.
