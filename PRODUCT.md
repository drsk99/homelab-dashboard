# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A small team of co-admins on a shared homelab (e.g. friends or family running a shared
NAS/server setup), all on the same trusted LAN. Anyone on the team can browse the dashboard;
adding/editing services is not currently role-gated (the app has no auth at all).

## Product Purpose

Gives a homelab team one page that shows every self-hosted service they run, grouped by
category, with live up/down status per service — so they don't have to remember URLs/ports
across many separately-hosted apps or open each one just to check it's alive.

## Positioning

Combines two jobs other tools usually split across separate products: a centralized,
categorized launcher (vs. a bookmarks folder or wiki page of links) and live health visibility
(vs. a static homepage/dashboard with no status checking). Both matter about equally — it's not
a status-monitoring tool with links bolted on, nor a launcher with status as an afterthought.

## Operating Context

Self-hosted on a machine within the homelab's LAN (`npm start`, default port 3000). Viewed from
other devices on the same LAN. No accounts — whoever can reach the port can view and manage
services.

## Capabilities and Constraints

- LAN-only by design; no authentication anywhere. Adding auth-shaped features changes the
  threat model and must not happen without the user explicitly asking for it.
- Data is a flat JSON array (`data/services.json`), read/written in full per request — no
  database, no migrations.
- No frontend build step or bundler; `public/app.js` is loaded directly as a plain script.
- Category auto-detection is regex-rule-based (`CATEGORY_RULES` in `server.js`), not
  configurable per-user beyond overriding the category field manually.
- A service counts as "up" if it responds with any HTTP status < 500 — services behind auth
  that return 401/403 still show green (documented limitation, not a bug to silently fix).

## Product Principles

1. Stay LAN-only and auth-free unless the user explicitly asks otherwise — that's a deliberate
   threat-model choice, not an oversight.
2. Keep the stack dependency-light (Express + flat JSON + no bundler) rather than reaching for
   a database or frontend framework as the app grows.
3. Status visibility and centralized launching are co-equal jobs — don't let future work
   optimize one at the expense of the other.
4. Category auto-detection should stay a helpful default, always overridable by hand, never a
   hard constraint on how a service is organized.
