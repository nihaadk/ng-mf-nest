# ng-mf-nest

Monorepo with three apps:

- **be-shell** – NestJS backend
- **fe-shell** – Angular frontend, shell/host for microfrontends
- **fe-mfe-1** – Angular microfrontend, loaded at runtime by fe-shell via [Native Federation](https://native-federation.com/)

## Microfrontend architecture (Native Federation)

`fe-shell` and `fe-mfe-1` are two independent Angular apps with their own `package.json`/`node_modules` — there is no shared build. `fe-shell` only loads `fe-mfe-1` in the browser, driven by the lazy route `/mfe-1` (`loadRemoteModule('mfe-1', './Component')`, see `fe-shell/src/app/app.routes.ts`).

Which URL is loaded for which remote is defined in `fe-shell/public/federation.manifest.json` (dev: `http://localhost:4201/remoteEntry.json`). For the prod build, this file is replaced in the Dockerfile by `federation.manifest.prod.json`, which points to the public Railway domain of `fe-mfe-1` (currently a placeholder — update it with the real domain after the first deploy of `fe-mfe-1`).

**Local start** (three terminals):

```bash
cd be-shell && npm run start:dev    # http://localhost:3000
cd fe-mfe-1 && npm start            # http://localhost:4201 (remote)
cd fe-shell && npm start            # http://localhost:4200 (shell) – then open /mfe-1
```

`fe-mfe-1` must be running *before* `/mfe-1` is opened in `fe-shell`, otherwise the fetch of `remoteEntry.json` fails.

## Deployment (Railway)

Each of the three apps is its own Railway service with its own `railway.json` in its respective folder:

| App | Builder | Start |
|---|---|---|
| `be-shell` | Nixpacks (`railway.json`) | `npm run start:prod` (`node dist/main`) |
| `fe-shell` | Docker (`Dockerfile`) | `serve -s browser -l $PORT` |
| `fe-mfe-1` | Docker (`Dockerfile`) | `serve -s browser -l $PORT --cors` |

### 1. Create three services

Create three services from this repo in the same Railway project, each with its Root Directory set to the matching folder:

- Service `be-shell` → Root Directory `be-shell`
- Service `fe-shell` → Root Directory `fe-shell`
- Service `fe-mfe-1` → Root Directory `fe-mfe-1`

Railway automatically picks up the respective `railway.json` per service and builds/deploys the three apps independently.

### 2. Order: backend + remote first, then the shell

`fe-shell` has the URLs of `be-shell` (API) and `fe-mfe-1` (remote) baked in **at build time** (no runtime env var lookup in the browser). Therefore:

1. Deploy **`be-shell`** → generate a public domain (Railway → Settings → Networking → *Generate Domain*).
2. Deploy **`fe-mfe-1`** → also generate a public domain.
3. If the generated domains differ from the previous assumptions, update them in `fe-shell`:
   - `fe-shell/src/environments/environment.prod.ts` → `apiUrl` to the `be-shell` domain
   - `fe-shell/public/federation.manifest.prod.json` → `"mfe-1"` to `https://<fe-mfe-1-domain>/remoteEntry.json`

   then commit and push.
4. Deploy **`fe-shell`** → generate a public domain.

### 3. Env vars

Set `FRONTEND_URL` on the `be-shell` service (value = the `fe-shell` domain, multiple origins comma-separated) so `app.enableCors()` in `be-shell/src/main.ts` allows the shell's domain. Without `FRONTEND_URL` set, `be-shell` currently allows all origins (`origin: true`) — for real production use, the variable should be set.

`fe-mfe-1` and `fe-shell` don't need any env vars — `PORT` is injected automatically by Railway and used in both Dockerfiles via `serve -l $PORT`.

### 4. After deploying, verify

- `https://<fe-shell-domain>/` loads and logging in with the demo user works (confirms `apiUrl`/CORS).
- `https://<fe-shell-domain>/mfe-1` loads the remote widget (confirms `federation.manifest.prod.json` + `--cors` on `fe-mfe-1`).
- Check the browser console/network tab for CORS or 404 errors when loading `remoteEntry.json`.

## Mock data

Auth in the backend (`be-shell/src/auth/auth.service.ts`) is completely mocked: no real DB, no real JWT, everything only lives in the process's memory and is lost on every restart/redeploy.

**Predefined demo user** (use it to log in on the frontend, also shown there as a hint):

| Email | Password |
|---|---|
| `demo@example.com` | `password123` |

**Create your own test user:** `POST /auth/register` with `{ "email": string, "password": string, "name"?: string }` creates an additional in-memory user (not persistent).

**Available endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new mock user |
| `POST` | `/auth/login` | Log in with email/password, returns a mock token |
| `POST` | `/auth/logout` | Invalidate the session/token (auth required) |
| `GET` | `/auth/me` | Get the logged-in user by their token (auth required) |

For protected endpoints, send the token as an `Authorization: Bearer <token>` header.
