# Adding a new microfrontend (Native Federation)

Step-by-step playbook for adding another remote app (like `fe-mfe-1`) to this
monorepo, wiring it into `fe-shell` via [Native
Federation](https://native-federation.com/), and deploying it to Railway.

Use `fe-mfe-1` as the reference implementation throughout — when in doubt,
copy its files and adjust the names.

This guide uses `fe-mfe-2` / remote name `mfe-2` / route `/mfe-2` as the
running example. Replace with your actual app name everywhere.

---

## 1. Scaffold the Angular app

```bash
cd /Users/nihadk/Workspace/ng-mf-nest
ng new fe-mfe-2 --routing --style=css --ssr=false
cd fe-mfe-2
```

Keep it a single-project workspace (app lives directly in `src/`, no
`projects/` subfolder) — same as `fe-shell` and `fe-mfe-1`.

## 2. Add Native Federation

Pick a **dev port that isn't already used** (`fe-shell` = 4200, `fe-mfe-1` =
4201 — so the next one is 4202):

```bash
ng add @angular-architects/native-federation@22.1.1 --port 4202 --type remote --skip-confirmation
```

This renames the existing `build`/`serve` targets to `esbuild`/`serve-original`
in `angular.json`, points `build`/`serve` at
`@angular-architects/native-federation:build`, adds `es-module-shims` to
polyfills, splits `src/main.ts` into a federation bootstrap +
`src/bootstrap.ts`, and generates `federation.config.mjs`.

## 3. Fix the federation `name` — the #1 gotcha

Open the generated `federation.config.mjs`. It defaults `name` to the
**project name** (`fe-mfe-2`). Change it to the short remote name you'll
actually use everywhere else (manifest key, route, `loadRemoteModule` call):

```js
export default withNativeFederation({
  // Must match the manifest key in fe-shell/public/federation.manifest*.json
  // and the remote name passed to loadRemoteModule('mfe-2', ...) — Native
  // Federation registers the remote under THIS name, not the manifest key.
  name: 'mfe-2',

  exposes: {
    './Component': './src/app/pages/widget/widget.ts',
  },

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },
  // ...keep the generated `skip` / `features` blocks as-is
});
```

**Why this matters:** Native Federation registers a loaded remote under the
`name` field from *its own* `federation.config.mjs` — not under whatever key
you used in the host's manifest to fetch it. If these don't match, the shell
fails at runtime with `NFError: Remote 'mfe-2' is not initialized`, even
though the manifest fetch and `remoteEntry.json` fetch both succeed.

**Do not remove or narrow `shared`.** `@angular/core` must stay a shared
singleton across host and every remote. If it isn't, the remote's component
gets instantiated with a *different* Angular runtime than the shell's, which
breaks Angular's DI and throws `NG0203: EnvironmentInjector token injection
failed` the moment the component is created.

## 4. Build the component you're exposing

Create the page/component you want to expose, e.g.
`src/app/pages/widget/widget.ts` (standalone, **self-contained styles** —
don't rely on the host's global stylesheet/Tailwind being loaded, since the
remote's CSS isn't guaranteed to ship with it):

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-widget',
  template: `<div class="card"><h1>Hello from fe-mfe-2</h1></div>`,
  styles: `.card { padding: 1.5rem; border: 1px solid #ddd; border-radius: .5rem; }`,
})
export class Widget {}
```

Point the exposed path in `federation.config.mjs` at it:

```js
exposes: {
  './Component': './src/app/pages/widget/widget.ts',
},
```

Also wire `path: ''` in `src/app/app.routes.ts` to this component, so
`ng serve` on this app alone shows something meaningful when developed
standalone.

## 5. Wire the remote into `fe-shell`

All in the `fe-shell` project:

**a) Dev manifest** — `fe-shell/public/federation.manifest.json`:

```json
{
  "mfe-1": "http://localhost:4201/remoteEntry.json",
  "mfe-2": "http://localhost:4202/remoteEntry.json"
}
```

**b) Prod manifest** — `fe-shell/public/federation.manifest.prod.json`
(placeholder domain until the real one exists, see step 8):

```json
{
  "mfe-1": "https://fe-mfe-1-production.up.railway.app/remoteEntry.json",
  "mfe-2": "https://fe-mfe-2-production.up.railway.app/remoteEntry.json"
}
```

**c) Route** — `fe-shell/src/app/app.routes.ts`:

```ts
{
  path: 'mfe-2',
  loadComponent: () =>
    loadRemoteModule('mfe-2', './Component').then((m) => m.Widget),
},
```

**d) Nav link** — `fe-shell/src/app/layout/header/header.ts`: add a
`routerLink="/mfe-2"` entry in both the desktop and mobile menus, same
pattern as the existing `/mfe-1` link.

## 6. Test locally before touching Railway

```bash
cd fe-mfe-2 && npm start     # :4202
cd fe-shell && npm start     # :4200
```

Open `http://localhost:4200/mfe-2`. Checklist if it doesn't render:

| Symptom | Cause | Fix |
|---|---|---|
| `NFError: Remote 'mfe-2' is not initialized` | `name` in `fe-mfe-2/federation.config.mjs` doesn't match the manifest key / `loadRemoteModule()` call | Align all three to the same string (step 3) |
| `NG0203: EnvironmentInjector token injection failed` | `shared` was emptied/disabled in one of the federation configs, so two separate copies of `@angular/core` are loaded | Restore `shareAll(...)` with `@angular/core` forced shared (step 3) |
| Nothing happens, no console error | Manifest fetch itself failed silently (`initFederation(...).catch(err => console.error(err))` swallows it and still boots the shell) | Check the Network tab for the `federation.manifest.json` / `remoteEntry.json` request, and check the console for the swallowed error |
| Route works but page is blank/unstyled | Component relies on global Tailwind/daisyUI classes that don't exist in this remote's own build | Use self-contained component `styles` (step 4) |

## 7. Add Docker + Railway config

Copy `fe-mfe-1/Dockerfile` and `fe-mfe-1/railway.json` into `fe-mfe-2/`,
adjusting the project name:

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist/fe-mfe-2/browser ./browser
ENV PORT=3000
EXPOSE 3000
# --cors: fe-shell runs on its own Railway domain and needs cross-origin
# fetch access to remoteEntry.json + chunks.
CMD ["sh", "-c", "serve -s browser -l $PORT --cors"]
```

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": { "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 10 }
}
```

Don't forget `--cors` — without it, `fe-shell`'s browser gets a CORS error
fetching `remoteEntry.json`/chunks from a different Railway domain.

Also add a `deploy` script to `fe-mfe-2/package.json`, matching the other
apps:

```json
"scripts": {
  "deploy": "railway up"
}
```

## 8. Create the Railway service

Two options — pick based on how the other services in this project are set up
(check the existing services first, see the note at the end):

**A) CLI-only (manual deploys, quick to set up)**

```bash
cd fe-mfe-2
railway link          # select the existing ng-mf-nest project
railway add            # choose "Empty Service", name it fe-mfe-2
railway service        # make sure fe-mfe-2 is linked in THIS directory
railway status          # double-check it really shows "fe-mfe-2", not another service
npm run deploy
railway domain          # generate a public domain, note the exact URL
```

⚠️ **Always run these from inside `fe-mfe-2/`.** Running `railway up` (or
`npm run deploy`) from the repo root, or via `npm --prefix fe-mfe-2 run
deploy` from the root, uploads the *entire monorepo* as build context —
Railway then fails with `Railpack could not determine how to build the app`
because it sees `be-shell/`, `fe-shell/`, `fe-mfe-1/`, `fe-mfe-2/` side by
side instead of one buildable app. `npm --prefix` does **not** change the
working directory the script itself runs in — only `cd` does.

Also double check `railway status` before every deploy: if the CLI's local
service link ever gets pointed at the wrong service, `npm run deploy` will
silently redeploy *that* service with this app's code instead.

**B) GitHub-connected (auto-deploy on push)**

1. Dashboard → this Railway project → *New Service* → *GitHub Repo* → this repo
2. Settings → Source → **Root Directory** = `fe-mfe-2`
3. Settings → Source → **Watch Paths** = `fe-mfe-2/**` (otherwise every push
   to the repo — even unrelated changes in `be-shell/` — redeploys this
   service too)
4. Settings → Source → if a **Config File Path** field is present, set it
   explicitly to `/fe-mfe-2/railway.json` (Railway's config file lookup does
   not automatically follow Root Directory)

## 9. Point `fe-shell`'s production manifest at the real domain

After the first successful deploy of `fe-mfe-2`, check its exact generated
domain (Railway may append a random suffix if the plain name is taken).
Update `fe-shell/public/federation.manifest.prod.json` if it differs from the
placeholder used in step 5, commit, and redeploy `fe-shell`.

## 10. Deploy `fe-shell`

```bash
cd fe-shell
npm run deploy      # or: git push, if GitHub-autodeploy is set up
```

Remember: deploying `fe-shell` does **not** build or redeploy `fe-mfe-2` (or
any other remote) — they're fully independent services. `fe-mfe-2` must
already be deployed and reachable *before* `/mfe-2` will work in the deployed
shell, since the remote is fetched client-side at runtime, not bundled into
`fe-shell`'s build.

## 11. Verify in production

- `https://<fe-shell-domain>/mfe-2` renders the remote's component
- Browser Network tab: `remoteEntry.json` request to the `fe-mfe-2` domain
  returns `200`, no CORS errors
- Browser console: no `NFError` / `NG0203`

---

## Quick reference: files touched per new MFE

| File | New file or edit? |
|---|---|
| `fe-mfe-N/federation.config.mjs` | new (generated by `ng add`, then edit `name` + `exposes`) |
| `fe-mfe-N/src/app/pages/widget/widget.ts` (or similar) | new |
| `fe-mfe-N/Dockerfile` | new (copy from `fe-mfe-1`) |
| `fe-mfe-N/railway.json` | new (copy from `fe-mfe-1`) |
| `fe-mfe-N/package.json` | edit — add `deploy` script |
| `fe-shell/public/federation.manifest.json` | edit — add dev entry |
| `fe-shell/public/federation.manifest.prod.json` | edit — add prod entry |
| `fe-shell/src/app/app.routes.ts` | edit — add lazy route |
| `fe-shell/src/app/layout/header/header.ts` | edit — add nav link |
