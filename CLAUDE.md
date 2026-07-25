# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies (just express)
npm start          # run the server on http://localhost:3000
PORT=8080 npm start  # run on a different port
```

There is no build step, test suite, or linter configured — this is a small, dependency-free
(besides Express) app served directly from `public/` as static files.

## Architecture

Single Express server (`server.js`) + a static vanilla-JS frontend (`public/`). No frontend
build/bundler — `public/app.js` is loaded directly by `public/index.html` via a `<script>` tag.

**Data layer**: services are stored as a flat JSON array in `data/services.json`, read/written
in full on every request (`loadServices`/`saveServices` in `server.js`) — no database, no
migrations. Each service object: `{ id, name, url, category, icon, description, node }`, with
`id` a `crypto.randomUUID()` assigned server-side on creation.

**Category auto-detection**: `CATEGORY_RULES` in `server.js` is an ordered list of
`[regex, categoryName]` pairs tested against `"<name> <url>"`; the first match wins, falling
back to `'Other'`. This is the *only* place category-guessing logic lives — the same list backs
`guessCategory()` (used on create when the client leaves `category` blank) and
`/api/categories` (which unions rule categories with categories already in use, for the
add/edit form's datalist autocomplete).

**Status checking**: `server.js` maintains an in-memory `Map` (`statusCache`, id → `{ ok, code,
checkedAt }`), refreshed for all services every 60s (`STATUS_REFRESH_MS`) via `setInterval`, plus
on-demand for a single service right after it's created/edited (fire-and-forget `checkOne()`
call, not awaited). A service is "up" if the HTTP response status is `< 500` (i.e. it responded
at all) — this means a service behind auth that returns 401/403 still shows green. There's also a
manual `POST /api/status/refresh` that awaits a full refresh before responding. The frontend
polls `GET /api/status` every 30s (`public/app.js`) independent of the 60s server-side refresh, so
displayed status can lag by up to ~30-90s from the true state.

**Frontend rendering**: `public/app.js` holds all state (`services`, `statuses`, `searchTerm`) in
module-level variables and re-renders the whole board (`render()`) from scratch on any change —
no diffing, no framework. Search filters client-side across name/category/description/node.
The same add/edit modal and form (`#serviceForm`) is reused for both actions; `openEdit` vs
`openAdd` toggles the delete button and pre-fills fields, and submit does a `PUT` vs `POST` based
on whether `fId.value` is set.

**No authentication anywhere** — this is designed for trusted-LAN use only (see README "Notes").
Don't add auth-shaped features without the user explicitly asking, since it changes the app's
threat model and deployment story.
