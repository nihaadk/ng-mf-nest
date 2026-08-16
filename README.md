# ng-mf-nest

Monorepo mit drei Apps:

- **be-shell** – NestJS Backend
- **fe-shell** – Angular Frontend, Shell/Host für Microfrontends
- **fe-mfe-1** – Angular Microfrontend, wird von fe-shell zur Laufzeit per [Native Federation](https://native-federation.com/) nachgeladen

## Microfrontend-Architektur (Native Federation)

`fe-shell` und `fe-mfe-1` sind zwei unabhängige Angular-Apps mit eigenem `package.json`/`node_modules` – es gibt keinen gemeinsamen Build. `fe-shell` lädt `fe-mfe-1` erst im Browser nach, gesteuert über die lazy Route `/mfe-1` (`loadRemoteModule('mfe-1', './Component')`, siehe `fe-shell/src/app/app.routes.ts`).

Welche URL für welchen Remote geladen wird, steht in `fe-shell/public/federation.manifest.json` (Dev: `http://localhost:4201/remoteEntry.json`). Für den Prod-Build wird diese Datei im Dockerfile durch `federation.manifest.prod.json` ersetzt, die auf die öffentliche Railway-Domain von `fe-mfe-1` zeigt (aktuell ein Platzhalter – nach dem ersten Deploy von `fe-mfe-1` dort die echte Domain eintragen).

**Lokal starten** (drei Terminals):

```bash
cd be-shell && npm run start:dev    # http://localhost:3000
cd fe-mfe-1 && npm start            # http://localhost:4201 (Remote)
cd fe-shell && npm start            # http://localhost:4200 (Shell) – dann /mfe-1 öffnen
```

`fe-mfe-1` muss laufen, *bevor* `/mfe-1` in `fe-shell` aufgerufen wird, sonst schlägt der Fetch von `remoteEntry.json` fehl.

## Mock-Daten

Die Auth im Backend (`be-shell/src/auth/auth.service.ts`) ist komplett gemockt: keine echte DB, kein echtes JWT, alles liegt nur im Arbeitsspeicher des Prozesses und geht bei jedem Neustart/Redeploy verloren.

**Vordefinierter Demo-User** (zum Einloggen im Frontend nutzen, wird auch dort als Hinweis angezeigt):

| E-Mail | Passwort |
|---|---|
| `demo@example.com` | `password123` |

**Eigene Test-User anlegen:** `POST /auth/register` mit `{ "email": string, "password": string, "name"?: string }` legt einen zusätzlichen In-Memory-User an (nicht persistent).

**Verfügbare Endpunkte:**

| Methode | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/auth/register` | Neuen Mock-User anlegen |
| `POST` | `/auth/login` | Mit E-Mail/Passwort einloggen, liefert Mock-Token |
| `POST` | `/auth/logout` | Session/Token invalidieren (Auth erforderlich) |
| `GET` | `/auth/me` | Eingeloggten User anhand des Tokens abrufen (Auth erforderlich) |

Für geschützte Endpunkte den Token als `Authorization: Bearer <token>` Header mitschicken.
