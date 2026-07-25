# Homelab Dashboard

A simple, clean dashboard for viewing all your homelab services in one place —
grouped into categories automatically, with live up/down status, and a manual
add/edit UI (no need to hand-edit config files, though you can if you want).

## Features

- **Category grid**: services are grouped into sections (Media, Network,
  Storage, Monitoring, Infrastructure, Dev Tools, Home Automation, Security,
  Productivity, Other).
- **Auto-categorization**: when you add a service, if you leave "Category"
  blank the app guesses one from the name/URL (e.g. "Plex" → Media,
  "Pi-hole" → Network). You can always override it.
- **Manual add/edit/delete**: click "+ Add service" or the ✎ icon on any
  card. Services live across different hosts/nodes — there's an optional
  "node" field to note which machine a service runs on.
- **Live status dots**: the backend pings each service URL every 60s
  (3s timeout) and shows a green/red dot on its card. The frontend refreshes
  status every 30s without a full reload.
- **Search**: filter cards by name, category, node, or description.

## Setup

```bash
cd homelab-dashboard
npm install
npm start
```

Then open **http://localhost:3000** (or `http://<this-machine's-ip>:3000`
from another device on your LAN).

To run on a different port:

```bash
PORT=8080 npm start
```

## Data

Services are stored in `data/services.json` as a flat JSON array. You can
edit this file by hand if you prefer (restart the server after manual edits),
or manage everything through the UI.

## API

- `GET /api/services` — list all services
- `POST /api/services` — add one (`{ name, url, category?, icon?, node?, description? }`)
- `PUT /api/services/:id` — update one
- `DELETE /api/services/:id` — remove one
- `GET /api/categories` — known categories (defaults + any custom ones in use)
- `GET /api/status` — cached up/down status per service id
- `POST /api/status/refresh` — force an immediate status recheck

## Notes

- No authentication — intended for trusted LAN use only. Don't expose this
  port to the internet without adding auth/a reverse proxy in front of it.
- Status checks are a simple `GET` request per service; services that block
  unauthenticated requests may show as "down" even if reachable in a browser.
