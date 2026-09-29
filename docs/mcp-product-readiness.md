# TeamGrid MCP: Zielbild und Umsetzungsplan

Stand: 29. September 2026. Status: Umsetzung läuft; öffentliche Pakete weiterhin 1.2.1.
Neue Schreibtools, Remote-MCP und die Freigabe des Browserlogins sind noch nicht ausgeliefert.
Dieses Dokument ist kein Production-Freigabenachweis.

### Umsetzungsstand am 29. September

- Staging läuft auf denselben App-/API-SHAs wie Production. Browserlogin wurde
  ausschließlich in Staging über den kontrollierten Workflow aktiviert:
  [Aktivierung](https://github.com/TeamGrid/teamgrid/actions/runs/36533474091).
  Die echte Benutzeranmeldung und anschließende Widerrufsprüfung sind noch offen.
- Im SDK-Kandidaten sind `context` (34 Lesewerkzeuge), `work` (41 Werkzeuge,
  davon sieben Schreibwerkzeuge), Workspace-Prüfung, Revisionen und stabile
  Erstellungsschlüssel implementiert. Bestehende Profile bleiben unverändert.
- Die Migration auf MCP SDK 2.2.0 und die explizite Unterstützung von
  Protokoll 2026-07-28 sind implementiert. Tests prüfen auch ältere Clients und
  die tatsächlich installierten stdio-Binaries.
- Eine regionale HTTP-Transportgrenze ist implementiert und lokal getestet:
  Metadaten, Audience-/Issuer-/Zellprüfung, frische Tokenprüfung, getrennte
  API-Delegation, Scope-Challenges, Begrenzungen und Abschalter. Der konkrete
  TeamGrid-OAuth-Provider samt Browserzustimmung, Refresh, CIMD und Speicherung
  ist weiterhin offen; es gibt noch keinen freigegebenen Remote-Endpunkt.
- Die App-Pipeline erhält einen maschinenlesbaren Qualifikationsnachweis vor
  Production-Aktivierung. Er bindet Tests an Zelle, App/API, Vertragsdigest und
  npm-Integritäten. Ungültige oder veraltete Nachweise scheitern vor der Änderung.
- Der Portal-Statusproxy ist im Dokumentations-PR korrigiert und auf große sowie
  zu große Antworten getestet. Veröffentlichung und Liveprüfung stehen noch aus.

Diese Änderungen sind Kandidaten, keine Aussage über bereits veröffentlichte
Funktionen. Zeit-/Timer-Schreibzugriffe und die übrigen offenen Abnahmepunkte
bleiben Teil der weiteren Umsetzung.

## Entscheidungsempfehlung

CLI-Browserlogin qualifizieren und aktivieren, anschließend einen ausdrücklich gewählten
Arbeitsmodus für alltägliche Änderungen ausliefern. Parallel die Architektur für einen gehosteten
MCP-Endpunkt mit delegierter Anmeldung festlegen. Die vorhandene API und deren Berechtigungen
bilden die gemeinsame Grundlage. Ein vollständiger Neubau wäre unnötig.

Eine gute MCP-Integration muss typische Arbeitsabläufe zuverlässig abschließen: einen Workspace
verbinden, die richtige Aufgabe finden, eine Änderung nachvollziehbar ausführen und das Ergebnis
prüfen. Die Anzahl der registrierten Werkzeuge allein ist kein Qualitätsmaß.

## 1. Verifizierter Ausgangspunkt

| Bereich | Befund | Konsequenz |
| --- | --- | --- |
| Öffentliches Paket | SDK, CLI und MCP 1.2.1 | Auf dieser veröffentlichten Basis qualifizieren |
| API | Vertrag 1.2.0, 237 v1-Operationen | Vorhandene Fachlogik wiederverwenden |
| MCP | Lokales stdio, 22/29/28/36 Tools in core/collaboration/governance/all | Alle Profile bleiben derzeit lesend |
| Browserlogin | Implementiert, in DE und US deaktiviert | Aktivierung ist ein eigener Rollout |
| Manuelle Anmeldung | Token-Import, Keychain und anschließender MCP-Aufruf erfolgreich geprüft | Funktionierender Einrichtungsweg bis zur Freigabe |
| Aufgaben schreiben | SDK verlangt Revision bei Änderung, Verschieben und Abschluss | Geeigneter erster Schreibumfang |
| Zeiterfassung | Gewöhnliche Updates und Timer nehmen im SDK keine zwingende Revision entgegen | Backend-Semantik und Wiederholungen vor MCP-Freigabe gesondert prüfen |
| Remote-MCP | Kein HTTP-Endpunkt, kein allgemein freigegebenes delegiertes OAuth | Eigener Architektur- und Implementierungsumfang |
| MCP-Protokoll | Eingebundenes SDK 1.30.0 unterstützt höchstens 2025-11-25 | Migration auf aktuelle Protokollgeneration qualifizieren |
| Dokumentation | Veraltete Versionen, Zählungen, Fehlertexte und Anmeldeanleitungen | Quellen synchronisieren und Prosa in Driftprüfungen einbeziehen |

Die Liveprüfung belegt sieben erfolgreiche lesende Aufrufe und negative Prüfungen von
Schema, fehlendem Scope und nicht registriertem Schreibtool. Sie ist keine Vollprüfung aller
36 Werkzeuge, Betriebssysteme oder Kundeninstallationen. Das bestehende DE-Testprofil war kein
Nachweis für die konkrete Installation des Kunden.

Quellstände:

- App: `82a518797a28a1bf247113159f58ee4975eff979`.
- API: `3d122fd6232a726e8e712ce6918f98408c0965ff`.
- Öffentliches Paket: `16acc3339ee6b6f1e556c79520fba34d8662b8d5`.
- API-Vertragsmanifest: `83c6c124e37dad78fdb4b52210c61a489d59122f440da3e1bec922a28b345646`.

## 2. CLI-Browserlogin: kurze Strecke bis zur brauchbaren Anmeldung

Vorhanden sind PKCE S256, zufälliger lokaler Callback, Workspace-Auswahl, Pairing-Phrase,
Scope-Zustimmung, einmaliger Code-Austausch und Speicherung im Betriebssystem-Schlüsselbund.
Die CLI verwendet den festen First-Party-Client `teamgrid-cli` und erstellt ein persönliches
Credential. Das ist noch kein allgemeiner OAuth-Provider für beliebige MCP-Clients.

### Offene Punkte

1. **Freigabenachweise aktualisieren.** Das App-Runbook
   `docs/runbooks/developer-cli-auth-qualification.md` führt 43 Szenarien und 40 Bedrohungs-IDs.
   Alte Kandidaten-SHAs und offene manuelle Checklisten gelten nicht als Nachweis für das heute
   installierte Paket. Vorhandene Belege wiederverwenden, soweit ihre Quellen tatsächlich passen.
2. **Echte Benutzerwege testen.** Bereits angemeldet und abgemeldet; normale Login-Verfahren,
   Workspace-Wechsel, DE/US, Zustimmung, Ablehnung, Abbruch und abgelaufener Code. Dazu Keychain,
   Windows Credential Manager und Linux Secret Service auf tatsächlich unterstützten Systemen.
3. **Nach Anmeldung weiterprüfen.** `auth status --check`, Workspace-Abgleich, erster MCP-Aufruf,
   Widerruf genau des Test-Credentials und anschließend verweigerter Zugriff in CLI und MCP.
4. **Grenzfälle:** Replay, paralleler Austausch, falscher Workspace/Zelle, entzogene Mitgliedschaft,
   gesperrter Workspace, fehlender Scope, gesperrter Schlüsselbund und abgebrochene Speicherung.
5. **Sensible Scopes erklären.** Die veröffentlichte CLI blockiert sie mit
   `browser_sensitive_scopes_unavailable`, solange ihre stärkere erneute Anmeldung fehlt.
   Dazu zählt `task-recurrences:read`. Die sieben entsprechenden Standardtools sind deshalb über
   einen gewöhnlichen Browserlogin nicht vollständig nutzbar. Bis zur Implementierung dieser
   Anmeldung ist ein gezielt ausgestellter manueller Token erforderlich.
6. **Passende Scope-Auswahl.** Das Standardpreset deckt vier Lesescopes ab, nicht alle 22 Tools.
   Ein MCP-Einrichtungsassistent sollte den tatsächlich benötigten Umfang erklären und prüfen.
   Das vorhandene `daily-work`-Preset enthält auch Zeit- und Kommentarrechte; für einen engeren
   Aufgabenmodus explizite Scopes verwenden, statt pauschal das größere Preset anzufordern.

### Rollout

Den vorhandenen Workflow `developer-principal-policy-release.yml` mit `enable-cli-auth` verwenden:
Staging, DE, US; nach jedem Schritt Nachweise und Beobachtung. `disable-cli-auth` mit einem
wegwerfbaren Test-Credential proben. Bestehende Personal-/Service-Credentials müssen weiterarbeiten.

Der derzeitige Schalter ist **zellweit**. Die Bezeichnung „Canary“ im Runbook bedeutet keine
Workspace-Allowlist. Für einen echten Kundenpilot zuerst eine serverseitig durchgesetzte
Workspace-/Benutzer-Freigabe ergänzen, die sowohl Anfrage als auch Austausch kontrolliert.
Alternativ die zellweite Freigabe nach vollständiger Staging-Qualifikation bewusst als solche planen.

Verbesserung des Release-Systems: Der Aktivierungsworkflow sollte einen maschinenlesbaren
Qualifikationsnachweis mit App-/API-SHA, Paketintegrität, Zelle, Testzeitpunkt und Ergebnis der
Rücknahmeprüfung verlangen. Gegenwärtige Principal- und Health-Gates ersetzen diese Benutzerwege
nicht. Auth-Aktivierung, Image-Deployment und neue MCP-Schreibfunktionen in getrennten Änderungen
beobachtbar halten.

## 3. Schreibmodus: kleiner, nützlicher erster Umfang

Ein **neues explizites Profil**, beispielsweise `work`, einführen. Bestehende Profile einschließlich
`all` behalten ihre Lesebedeutung. Ein Paketupdate darf keine bisherige Installation schreibfähig
machen. Profilwahl, Credential-Scopes, Ressourcenfreigaben und aktuelle Benutzerrechte bleiben
eigenständige Prüfungen.

| Priorität | Arbeitsablauf | Vorhandene Grundlage / offene Arbeit |
| --- | --- | --- |
| Erste Freigabe | Aufgabe anlegen | `tasks.create`, dauerhafter Idempotency-Key |
| Erste Freigabe | Name, Beschreibung, Termin und Verantwortliche ändern | `tasks.update` mit erwarteter Revision; assigneeIds/primaryAssigneeId korrekt erhalten |
| Erste Freigabe | Aufgabe verschieben, abschließen, wieder öffnen | `tasks.move/complete/reopen`; Zielrechte und Revision prüfen |
| Erste Freigabe | Kommentar lesen und hinzufügen | `comments.list/get/create`; Kommentarerstellung kann Benachrichtigungen auslösen |
| Danach | Zeit erfassen, Timer starten/stoppen | Bestehende API, aber Mehrfachausführung, aktive Timer und Konkurrenzfälle qualifizieren |
| Danach | Projektstammdaten bearbeiten | Revision vorhanden; Lebenszyklusaktionen teilweise asynchron |
| Danach | Dokumente, Dateien, Kalender und konkrete Custom-Field-Werte lesen | Fehlender Kontext begrenzt heute vollständige Arbeitsabläufe |
| Gesonderte Freigabe | Massenänderungen, Archivierung, Freigaben, Finanzen und Administration | Höhere Wirkung; eigene Rechte und Bestätigungsregeln |

### Verbindlicher Änderungsvertrag

- Bestehende Objekte vor einer Änderung gezielt lesen. Die dabei erhaltene Revision für exakt
  diesen Änderungswunsch verwenden. Bei Konflikt aktuellen Stand und Unterschiede zeigen;
  keine automatische neue Revision holen, um die alte Absicht ungeprüft durchzusetzen.
- Für Erstellungen einen Idempotency-Key pro Benutzerabsicht bis zur eindeutigen Auflösung erhalten.
  Derselbe Key muss auch bei einer erneuten MCP-Tool-Anforderung wiederverwendet werden können.
  Die heutige SDK-Generierung je Methodenaufruf allein löst Wiederholungen durch den Host nicht.
- Timeouts nach einer Mutation bedeuten zunächst „Ergebnis unklar“. Über Key/Operation/gezielten
  Read auflösen. Schreiboperationen ohne serverseitige Wiederholungsgarantie nicht blind wiederholen.
- Fehler erhalten stabile Codes, Request-ID und klare nächste Schritte. Erfolgsantworten enthalten
  nur nötige Felder, neue Revision und den tatsächlich erreichten Zustand. Ein angenommenes
  asynchrones Projektkommando ist noch kein abgeschlossenes Projekt.
- Werkzeuge erhalten zutreffende `readOnlyHint`, `destructiveHint` und `idempotentHint`-Werte.
  Diese Hinweise ersetzen keine serverseitige Prüfung oder Einwilligung.
- Gewöhnliche autorisierte Änderungen verwenden die Bestätigungsmechanismen des jeweiligen Hosts.
  Für besonders weitreichende spätere Aktionen gegebenenfalls eine echte, angemeldete
  TeamGrid-Freigabe an Workspace, Aktion, Inhalt und Ablaufzeit binden. Ein vom Modell gesetztes
  `confirm: true` ist kein Beleg für Zustimmung.
- Live-Prüfung von Mitgliedschaft, Scope, Sharing, Workspace-Sperre und Zelle erfolgt weiterhin
  in der API. Metadaten aus einem alten MCP-Aufruf dürfen diese Prüfung nicht ersetzen.
- Auditdaten verknüpfen handelnde Person/Service-Identität, OAuth-Client, Workspace, Aktion und
  Request-ID. Inhalte und Geheimnisse nicht pauschal in Traces oder Fehlermeldungen kopieren.

Quellen für die Bestätigungs- und Metadatenkonzepte:
[MCP Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools),
[OpenAI MCP-Aufrufsteuerung](https://developers.openai.com/api/docs/guides/tools-connectors-mcp).

## 4. Gehostetes MCP und aktuelle Protokollgeneration

Ziel: TeamGrid im Client auswählen, über TeamGrid anmelden, Workspace und Rechte bestätigen,
anschließend direkt arbeiten. Lokales stdio bleibt für bestehende Installationen verfügbar.

### Architektur

Ein regional betriebener HTTPS-MCP-Endpunkt nutzt dieselben fachlichen Adapter und
Autorisierungsregeln wie der lokale Server. Jeder HTTP-Request erhält einen eigenen geprüften
Benutzerkontext. Keine global gespeicherten API-Clients mit wechselnden Nutzertokens; Caches und
Tool-Discovery dürfen keine Daten oder Rechte zwischen Benutzern vermischen.

Die regionale Datenverarbeitung und Workspace-Bindung gelten auch für MCP. Eine zentrale
Anmeldeoberfläche darf nicht versehentlich Geschäftsdaten in die andere Zelle verschieben.
Endpunktnamen und OAuth-Ressourcenkennung erst im Architekturentscheid verbindlich festlegen.

Für HTTP ist eine OAuth-2.1-Anbindung mit PKCE, Resource-/Authorization-Server-Metadaten,
ressourcengebundenen Tokens, korrekter Issuer-Prüfung und begrenzten Scopes erforderlich.
CIMD ist für neue Clients vorzusehen; DCR nur für nötige Kompatibilität. Token-Erneuerung,
Widerruf und fehlende Scopes gehören in dieselbe Qualifikation. Der MCP-Token darf nicht einfach
als beliebiger API-Token durchgereicht werden. Den Übergang in die vorhandene API-Autorisierung
über eine explizite Delegation oder gemeinsame Autorisierungsschicht entwerfen.
[MCP Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).

Metadatenabrufe und Clientregistrierung gegen SSRF absichern: zulässige HTTPS-Ziele, begrenzte
Antworten und Redirects, keine privaten Netzwerkziele. Proxy-, Host- und Origin-Prüfung sowie
Rate-Limits sind Bestandteil der HTTP-Qualifikation.

OpenAI dokumentiert für authentifizierte Plugins die Metadaten, PKCE und mehrere Wege zur
Clientregistrierung. Daraus folgt keine automatisch bewiesene TeamGrid-Kompatibilität; Callback,
Clientidentität und Berechtigungsabfrage müssen im tatsächlichen Host getestet werden.
[OpenAI Authentication](https://developers.openai.com/apps-sdk/build/auth).

Die aktuelle Spezifikation ist **2026-07-28**. Der offizielle TypeScript-Migrationsweg führt von
SDK v1 zu den v2-Paketen; moderne Protokollunterstützung muss explizit aktiviert werden. Legacy-
Clients weiterhin qualifizieren. Nicht nur die Versionsnummer ändern: Discovery, Transport,
Authentifizierung, Ergebnisformate und Metadaten müssen zusammen passen.
[Offizielle SDK-Migration](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28).

Optionale MCP-Erweiterungen wie Apps, Tasks oder Elicitation nur dort einsetzen, wo ein konkreter
TeamGrid-Ablauf davon profitiert. Für grundlegende Aufgabenänderungen sind sie kein Selbstzweck.

### Kompatibilitätsmatrix als Freigabebeleg

| Ziel | Zu qualifizieren | Aktueller Nachweis |
| --- | --- | --- |
| Lokaler SDK-Testclient | stdio, 4 Profile, Scopes, Fehler | Teilweise live geprüft |
| Codex / geeignete lokale MCP-Hosts | Installation, Schlüsselbund, Werkzeugwahl, Bestätigung, Neustart | Einrichtungsdokumentation; vollständige neue Schreibtests offen |
| ChatGPT und gehostete MCP-Clients | HTTPS, OAuth, Callback, Reconnect, Scope-Erweiterung, Widerruf | TeamGrid-Remote-Endpunkt fehlt |
| Claude, Cursor, VS Code als weitere Zielclients | Tatsächlich unterstützten Transport und Auth-Weg je aktueller Version messen | Nicht als geprüft bewerben |

Clientversion, Betriebssystem, Protokoll, getesteter Ablauf und bekannte Einschränkungen speichern.
Ein erfolgreicher SDK-Handshake ersetzt diese Matrix nicht.

## 5. Produktqualität und Betrieb

1. **Einrichtung:** Profil/Workspace eindeutig benennen, Verbindung prüfen, Rechte nachvollziehbar
   erweitern. Ein Diagnosekommando erklärt „nicht angemeldet“, „Scope fehlt“ und „Tool nicht im
   Profil“ getrennt und sammelt keine Geheimnisse.
2. **Werkzeuge:** Kleine fachliche Aktionen, verständliche Beschreibungen, stabile Namen und
   konkrete Ergebnis-Schemas. Der bestehende generische JSON-Datenbereich im Output-Schema kann
   die jeweilige Fachstruktur präziser beschreiben.
3. **Kontext:** Suche und Benutzer-/Listenauflösung im Arbeitsmodus ermöglichen. IDs, Datumswerte,
   Zeitzonen, Mehrfachzuweisungen und Paginierung müssen ohne Raten handhabbar sein.
4. **Messung:** Verbindungs-/Login-Erfolgsquote, Zeit bis zur ersten erfolgreichen Aktion,
   Fehlerraten pro Werkzeug, P95-Laufzeit, Konflikte, Widerrufszeit und doppelte Ausführungen
   erfassen. Nach einer Baseline konkrete Grenzwerte im Freigabeplan festlegen.
5. **Synthetische Tests:** Eigene DE-/US-Testworkspaces mit isolierten Credentials. Lesen sowie
   Anlegen → Ändern → Konflikt → Abschluss → Aufräumen nachvollziehbar prüfen.
6. **Konkurrenz und Ausfälle:** Zwei Benutzer, Rechteentzug zwischen Lesen und Schreiben,
   Worker-Neustart, Timeout nach Commit und Wiederholung mit demselben Key abdecken.
7. **Manipulierter Inhalt:** Aufgabenbeschreibungen, Kommentare und Dokumente als Daten behandeln;
   sie dürfen keine Rechte erweitern oder fremde Ziele für Anfragen bestimmen.
8. **Betrieb:** Eigene Kill-Switches für neue Browserautorisierung, MCP-Schreibmodus und Remote-
   Zugang. Bestehende Lesefunktionen und die stehende DE-/US-Feature-Baseline bewahren.

## 6. Dokumentation und Release-System

Sofort korrigiert werden die öffentliche Paket-/Vertragsbasis, Profilgrößen, tatsächliche
Fehlercodes, Entfernung der Abrechnungsfelder und die aktuell verfügbare manuelle Anmeldung.
Zukünftige Funktionen erst nach ihrer jeweiligen Freigabe in die Einrichtungsanleitung aufnehmen.

Für jedes Release zusammenführen:

- Exakte App-/API-Identität, Paketversion und npm-Integrität.
- Aus dem tatsächlichen Registry-Aufruf erzeugte Toolreferenz und API-Vertragsdigest.
- Aktuelle Verfügbarkeit von Browserlogin, Schreibmodus und Remote-Zugang pro Zelle.
- Getestete Client-/Betriebssystemmatrix und reproduzierbarer erster Arbeitsablauf.
- Driftprüfung für handgeschriebene Einstiegstexte zusätzlich zu generierten Referenzen.
- Status-/Dokumentations-Smoke nach Deployment mit kontrollierter Rücknahme bei Fehlern.

Separater Betriebsfehler im veröffentlichten Portal: Der Statusproxy begrenzt Antworten auf 256 KiB, während
der Statusdienst beim Audit 422.460 Bytes einschließlich Historie lieferte. Das Portal antwortete
deshalb 503 trotz gesundem Upstream. Einen kleinen Status-Summary-Endpunkt bevorzugen oder die
Grenze nach einer begrenzten Zwischenlösung testen. Im Kandidaten ist die Grenze auf 1 MiB
angehoben; deklarierte und tatsächlich gestreamte Übergrößen werden abgebrochen. Die Ausgabe
bleibt die kleine Statusprojektion. Keine unbegrenzte Antwortverarbeitung.
Dieser Fehler muss vor einem als vollständig grün bezeichneten Portal-Release behoben werden.

## 7. Lieferreihenfolge und Abnahmekriterien

| Schritt | Ergebnis | Abnahme |
| --- | --- | --- |
| A: Verlässlicher Einstieg | Aktuelle Docs und Browserlogin im Pilot | Echte Neuverbindung bis MCP-Aufruf, Widerruf und Rücknahme in Staging/DE/US |
| B: Arbeitsmodus | Aufgaben- und Kommentarwerkzeuge | Opt-in; korrekte Rechte, Konkurrenz, Wiederholung, Audit und Aufräumen |
| C: Direkte Verbindung | Remote-MCP und delegiertes OAuth | Echter Host-Login, Regionalität, Isolation, Erneuerung/Widerruf, Protokollkompatibilität |
| D: Vollständige Abläufe | Zeit, Dateien, Kalender und weitere Kontextwerkzeuge nach Bedarf | Konkrete Anwenderabläufe bestanden; Betriebswerte im vereinbarten Bereich |

A und die Architekturarbeit für C können gleichzeitig vorbereitet werden. Die erste nützliche
Schreibfreigabe muss nicht auf alle späteren Domänen warten. Eine belastbare Aufwandsschätzung
erfolgt nach Sichtung der wiederverwendbaren Auth-Qualifikationsbelege und Auswahl der zuerst
unterstützten Hosts. Insbesondere Remote-OAuth ist eine eigene Produktfunktion, kein Flag-Toggle.

Nicht in dieser Analyse durchgeführt: Production-Flags ändern, OAuth veröffentlichen,
Kundendaten schreiben oder dem Kunden eine Nachricht senden.
