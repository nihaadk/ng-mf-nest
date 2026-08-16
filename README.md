# ng-mf-nest

Monorepo mit zwei Apps:

- **be-shell** – NestJS Backend
- **fe-shell** – Angular Frontend

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
