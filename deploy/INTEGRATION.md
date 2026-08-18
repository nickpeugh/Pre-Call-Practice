# Onboarding Tracker — Vibez integration spec

What the app calls today, and what you need to stand up for it to be fully live.
Everything below is what the shipped code actually sends — no aspirational shapes.

The manager enters **Host API base URL** in the app under **Sharing → Slack & email
connections** (e.g. `https://onboarding.vibez.carvana.com/api`). Trailing slashes are
stripped. Every route below is relative to that base.

---

## 1. `POST /slack/notify` — live today

Fires automatically when a teammate is added and when coverage starts. Also fired by
"Post to Slack" in the recap modal and by "Send a test".

**Request**

```
POST {apiBase}/slack/notify
Content-Type: application/json
```

```json
{
  "channel": "#onboarding",
  "text": "Added to an onboarding checklist",
  "blocks": [
    { "type": "header",
      "text": { "type": "plain_text", "text": "Added to an onboarding checklist", "emoji": false } },
    { "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Who*\nsam.torres@carvana.com" },
        { "type": "mrkdwn", "text": "*Checklist*\nMarcus Webb — Reconditioning" },
        { "type": "mrkdwn", "text": "*Added by*\nDana Reyes" },
        { "type": "mrkdwn", "text": "*Start date*\n2026-08-17" }
      ] },
    { "type": "context",
      "elements": [ { "type": "mrkdwn", "text": "Sent from the Carvana × ADESA Onboarding tracker" } ] }
  ]
}
```

Notes:
- The body is already valid Slack Block Kit — you can forward it to
  `chat.postMessage` or an incoming webhook as-is.
- `channel` is whatever the manager typed; omit or override server-side if you'd
  rather pin the channel.
- `fields` is capped at 10 entries.
- `text` is the plain-text fallback for notifications.

**Response** — any `2xx`. The app ignores the body and only checks `response.ok`.
Non-2xx surfaces "Slack post failed — check the URL" to the manager.

**Titles the app sends**

| Trigger | `text` |
|---|---|
| Teammate added | `Added to an onboarding checklist` |
| Coverage started | `Onboarding coverage starting` |
| Recap posted | `Onboarding recap — {hire name}` |
| Test button | `Onboarding tracker connected` |

---

## 2. `POST /email/send` — live today

Fires alongside each Slack post.

**Request**

```
POST {apiBase}/email/send
Content-Type: application/json
```

```json
{
  "to": "sam.torres@carvana.com,jo.msika@carvana.com",
  "subject": "Added to an onboarding checklist: Marcus Webb",
  "body": "Dana Reyes added you as an editor on the onboarding checklist for Marcus Webb.\n\nYou can check tasks off, edit them and add notes.",
  "from": "onboarding@carvana.com"
}
```

Notes:
- `to` is a comma-separated list (coverage emails go to every teammate at once).
- `body` is plain text with `\n` line breaks — wrap it in your own HTML template
  if you want it branded.
- `from` is optional; it's whatever the manager typed in "Send email from". Omit
  the field entirely if they left it blank.
- The recap email sends `to: ""` — the manager picks recipients in their client
  today. If you'd rather it send directly, tell me and I'll add a recipient field.

**Response** — any `2xx`. Non-2xx surfaces "Send failed — check the host API".

---

## 3. Auth — decided: Okta session cookie, same origin

Managers sign in with Okta. You do the OIDC exchange server-side and set a session
cookie; the browser then presents it automatically on every later request, so no
token handling in the app.

**Requirement this puts on hosting:** the API must sit under the same origin as the
app — e.g. app at `https://onboarding.vibez.carvana.com/` and API at
`https://onboarding.vibez.carvana.com/api`. Same host, different path.

The app sends `credentials: 'same-origin'` on `/auth/me`. If the API ends up on a
different hostname, it needs a bearer token instead — tell me and I'll add it.

Reject unauthenticated calls to `/slack/notify`, `/email/send` and
`/checklists/*` with `401`.

---

## 4. Okta routes — the app already calls these

As soon as a **Host API base URL** is set, the app stops faking sign-in:

| App behaviour | Route it uses |
|---|---|
| On load, asks who's signed in | `GET {apiBase}/auth/me` |
| "Continue with Okta" button | redirects to `GET {apiBase}/auth/login?returnTo={current url}` |
| "Sign out" | redirects to `GET {apiBase}/auth/logout` |

`/auth/login` should run the authorization code + PKCE flow against Carvana's Okta
app, set the session cookie, then redirect back to `returnTo`.

`/auth/me` returns:

```
GET {apiBase}/auth/me        → 200
{ "name": "Dana Reyes", "email": "dana.reyes@carvana.com", "initials": "DR" }
                             → 401 when not signed in
```

`initials` is optional — the app can derive it from `name`.

If you also return the manager's direct reports, the app prefills the roster on first
sign-in — this is already wired. It only seeds when the roster is still empty, so it
never overwrites hires a manager has already entered.

```json
{ "name": "...", "email": "...",
  "reports": [
    { "name": "Marcus Webb", "role": "Recon Tech II",
      "start": "2026-08-17", "dept": "inspection" }
  ] }
```

`dept` must be one of: `corporate`, `market_ops`, `logistics`, `inspection`
(Reconditioning), `adesa` (Auction). The first three render in Carvana navy, the
last two in ADESA teal.

---

## 5. Shared checklists — the last real gap

Progress, notes, edits and the teammate list live in `localStorage` today, so two
people don't see each other's checkmarks. To fix it, store the per-hire blob:

```
GET  {apiBase}/checklists/{hireId}   → 200 { "rev": 41, "state": { ... } }
PUT  {apiBase}/checklists/{hireId}     body { "rev": 41, "state": { ... } }
                                       → 200 { "rev": 42 }
                                       → 409 on stale rev
```

`state` is the same object the app already writes to `localStorage` under
`cvna_onb_v1`: `{ checks, notes, edits, cards, valuesReviewed, hires, activeId }`.
Send `rev` back on every write and reject stale ones so two managers on a shop
floor don't clobber each other.

Access control comes from the teammate list — `owner` plus each entry's role
(`editor`, `checker`, `viewer`).

---

## 6. Fallback behaviour when the API base is empty

Worth knowing so nothing looks broken mid-rollout:

- **Slack** — if only an incoming webhook is set, the app POSTs to it directly with
  `mode: 'no-cors'`. The message sends, but the browser can't read the response, so
  there's no delivery confirmation and the webhook URL is visible in the page.
  Fine for a pilot; not for GA.
- **Email** — opens a prefilled Gmail compose window.
- **Neither set** — the app says "Add a Slack webhook or host API below" and does
  nothing else.

---

## 7. Hosting checklist

- Serve the whole folder as static files: `Onboarding App.dc.html`, `support.js`,
  `values-images.js`, `assets/`, `_ds/`.
- Same origin for app and API, so the session cookie and CORS both stay simple.
- The app already ships home-screen install metadata (`apple-mobile-web-app-*`,
  `theme-color`, apple touch icon), so it installs full-screen on iPad.
- Set a real favicon/touch icon if you don't want the ADESA star.
