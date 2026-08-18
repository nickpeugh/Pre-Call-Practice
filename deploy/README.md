# Deploy this folder to Vibez

Static files. No build step, no npm install.

```
index.html          the app
support.js          runtime it needs — must sit next to index.html
values-images.js    Carvana Values artwork
assets/             logos, lockups, app icons, brand graphics
_ds/                design system stylesheets and fonts
INTEGRATION.md      the API spec for the endpoints below
```

## 1. Upload

Serve the folder so `index.html` is the root document. Keep the folder structure
exactly as-is — every path in the app is relative, so moving files breaks images.

Confirm it loads before wiring anything up: you should land on the navy Okta
sign-in screen. The demo sign-in still works at this point.

## 2. Stand up two routes to test Slack

| Route | Purpose |
|---|---|
| `POST /api/slack/notify` | forwards a Block Kit payload to Slack |
| `POST /api/email/send`   | sends `{to, subject, body, from}` |

Exact request bodies are in `INTEGRATION.md` §1–2. The Slack body is already valid
Block Kit — forward it to `chat.postMessage` or an incoming webhook unchanged.

## 3. Stand up three routes to test Okta

| Route | Purpose |
|---|---|
| `GET /api/auth/login?returnTo=…` | run Okta OIDC, set session cookie, redirect back |
| `GET /api/auth/me`               | return `{name, email}` — or `401` |
| `GET /api/auth/logout`           | clear the session |

Details in `INTEGRATION.md` §4.

**The API must be on the same hostname as the app** — app at
`https<no>://onboarding.vibez.carvana.com/` and API at `…/api`. Different path is
fine; different hostname breaks the session cookie and I'd need to add token
handling instead.

## 4. Switch the app over

Open the app → **Sharing** → **Slack & email connections** → put your base URL in
**Host API base URL**, e.g.:

```
https://onboarding.vibez.carvana.com/api
```

That one field flips everything at once:

- "Continue with Okta" stops faking it and redirects to `/api/auth/login`
- The app checks `/api/auth/me` on every load
- Adding a teammate and starting coverage fire real Slack posts and emails
- "Send a test" posts to Slack and sends an email so you can confirm both

The value is saved in the browser, so each tester enters it once. If you'd rather
hardcode it for everyone, tell me and I'll bake it in.

## 5. What to actually test

1. Sign in with your own Okta credentials — does your real name appear in the header?
2. Sharing → **Send a test** — does the Slack message land in the channel, and the email in your inbox?
3. Add a teammate by email — do they get the Slack post and the email?
4. Set coverage dates, hit **Start coverage** — same two notifications, different wording.
5. Send Recap → **Post to Slack** and **Send by email**.
6. On an iPad in landscape: are all header buttons reachable, and does Add to Home Screen open it full-screen?

## Known gaps at this stage

- **Checkmarks are still per-browser.** Two people opening the same checklist won't
  see each other's progress until `/api/checklists/{hireId}` exists
  (`INTEGRATION.md` §5). Everything else works without it.
- **Roster prefill** needs your `/auth/me` to return a `reports` array. Without it,
  managers type hires in as they do today.

## Editing after deploy

Edit the source, not the deployed copy — a redeploy overwrites anything changed
in place, and then the two versions disagree. Ask for a fresh package and replace
the folder.
