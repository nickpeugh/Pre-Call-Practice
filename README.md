# Carvana × ADESA Onboarding Tracker — deploy

This service hosts the static **Onboarding Tracker** bundle (in [`deploy/`](deploy/))
behind a small Express server so it can run on Cloud Run.

The bundle is a self-contained static build — relative paths, no framework build
step. The server just serves the folder with `index.html` at the root and sets a
permissive `frame-ancestors` CSP so the app can be embedded (e.g. Google Sites).

## Run locally

```
npm install
npm start        # tsx server.ts → http://localhost:3000
```

You should land on the navy Okta sign-in screen; the demo sign-in works with no
backend configured.

## Layout

```
server.ts             static host + /api/health
deploy/               the app bundle (served at /)
  index.html          the app
  support.js          runtime it needs — must sit next to index.html
  values-images.js    Carvana Values artwork
  assets/             logos, lockups, app icons, brand graphics
  _ds/                design system stylesheets and fonts
  README.md           hosting notes
  INTEGRATION.md      backend API spec (Slack / email / Okta / shared checklists)
```

## Backend integration

The app runs fully in a local/demo mode until a manager sets a **Host API base URL**
under **Sharing → Slack & email connections**. Standing up those routes
(`/slack/notify`, `/email/send`, `/auth/*`, `/checklists/*`) against Carvana infra
is documented in [`deploy/INTEGRATION.md`](deploy/INTEGRATION.md). They must sit on
the same origin as the app (e.g. app at `/`, API at `/api`) so the Okta session
cookie works without token handling.

> Editing after deploy: change the source bundle and redeploy — a redeploy
> overwrites the served copy, so don't hand-edit files under `deploy/`.
