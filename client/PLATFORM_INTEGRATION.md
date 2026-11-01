# jace-s.com Platform Integration Record

The React client in `client/` is the only source of the Visualizer UI.
API server: `https://jace-s.com` (`jace-s-platform` repository).

## Baseline

| Item | Value |
| --- | --- |
| Client base commit | `0f1c15c028073ce238e7e4f61e1eec5dc326cce1` |
| Server base commit (`jace-s-platform`) | `e2b51eaed80186dc8c73896beb90f1f3900a2cff` (not yet pushed; remote `main` was `2e837b1` at the time of recording) |
| Registered app ID | `21` (`REACT_APP_NOTICE_APP_ID=21`) |
| Verified deployed version | Not verified yet |

Server state at recording (reported by the operator): production `/health` already returns schemaVersion 1.
The server currently ignores `?app` and returns all-app notices only; per-app notices start working after the
server deploy with no client change. `https://visualizer.jace-s.com` is not an allowed origin yet, so the login UI
stays hidden on `gpt-3d-visualizer.vercel.app` (default `REACT_APP_LOGIN_HOSTS`).

## Build Settings

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_URL` | Platform origin, e.g. `https://jace-s.com` |
| `REACT_APP_API_PREFIX` | Visualizer API prefix, e.g. `/api/gptvisualizer` |
| `REACT_APP_NOTICE_APP_ID` | Registered app ID (positive integer). Empty or invalid → `/health` without `app`, so only all-app notices are received |
| `REACT_APP_LOGIN_HOSTS` | Optional, comma-separated hostnames that show the login UI. Default: `visualizer.jace-s.com` |

## Behavior

- No prewarm call. The client never requests `/external/health`.
- On entry: one `GET /health?app=<id>` without credentials, 10 s timeout. A 503 body is still parsed.
  Fetch failure, invalid JSON, unknown `schemaVersion` or `serviceStatus` → "Status unknown" (never shown as maintenance).
  `message`, announcement `title` and `content` are rendered as plain text.
  `maintenance` status disables the Visualize button.
- Login (only on `REACT_APP_LOGIN_HOSTS`): `GET /api/auth/session` with `credentials: 'include'` on entry,
  on window focus, and when the opened window closes. Login and account pages open in a new window.
  Network failure → "Failed to check login status" (not treated as logged out). No session-based POST/PUT/DELETE.
- Inference and comment requests are sent with `credentials: 'omit'`. Inference has no client timeout
  (must not be shorter than the 30 s server proxy). Error messages: 400, 413, 429, 502, 503, 504, network failure.
  Comment 429 shows a fixed message.

## Verification

Checked with a production build and Playwright using mocked platform responses (not the real server):

- [x] No `/external/health` request
- [x] `/health?app=<id>`: operational (no banner), maintenance 503 (banner, notices, button disabled),
      unavailable 503 (server message shown), network failure / invalid JSON / unknown schema ("Status unknown")
- [x] Notice HTML is shown as text
- [x] Session cookie sent only on `/api/auth/session`, not on `/health` or inference
- [x] Login window URL `/login?lang=<lang>`; 200 after close → display name; 401 on focus → login button;
      network failure → "Failed to check login status"
- [x] Login UI hidden on hosts outside `REACT_APP_LOGIN_HOSTS`
- [x] Inference 400, 413, 429, 502, 503, 504 messages

Pending (needs the real deployment):

- [ ] `visualizer.jace-s.com` domain connected in Vercel (repository owner)
- [ ] `https://visualizer.jace-s.com` added to the server's allowed origins before deploying
- [ ] Real login → name → logout on jace-s.com → login button after focus
- [ ] Login UI not shown on `gpt-3d-visualizer.vercel.app`
- [ ] Set `REACT_APP_NOTICE_APP_ID=21` in the Vercel project (Production and Preview)
- [ ] Fill in the verified deployed version above
