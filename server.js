const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'services.json');
const STATUS_TIMEOUT_MS = 3000;
const STATUS_REFRESH_MS = 60 * 1000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- default category suggestions, keyword -> category ---
const CATEGORY_RULES = [
  [/plex|jellyfin|emby|sonarr|radarr|lidarr|bazarr|prowlarr|tautulli|overseerr|jellyseerr|kodi/i, 'Media'],
  [/pi[-\s]?hole|adguard|unifi|opnsense|pfsense|router|dns|vpn|wireguard|tailscale|traefik|nginx.?proxy|caddy/i, 'Network'],
  [/nextcloud|owncloud|syncthing|samba|nas|minio|s3|files?\b/i, 'Storage'],
  [/grafana|prometheus|uptime|kuma|netdata|zabbix|influx|loki|status/i, 'Monitoring'],
  [/portainer|docker|kubernetes|k8s|rancher|proxmox|esxi|watchtower/i, 'Infrastructure'],
  [/git(ea|lab|hub)?|jenkins|drone|code[\s-]?server|vscode|sonarqube|registry/i, 'Dev Tools'],
  [/home ?assistant|homebridge|zigbee|zwave|mqtt|esphome|node-red/i, 'Home Automation'],
  [/vault|authelia|authentik|keycloak|bitwarden|vaultwarden|guacamole|wireguard/i, 'Security'],
  [/wiki|bookstack|paperless|notes?|photoprism|immich|calibre/i, 'Productivity'],
];

function guessCategory(name = '', url = '') {
  const haystack = `${name} ${url}`;
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(haystack)) return category;
  }
  return 'Other';
}

// --- data store (flat JSON file) ---
function loadServices() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveServices(services) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(services, null, 2));
}

// --- status cache ---
const statusCache = new Map(); // id -> { ok, code, checkedAt }

async function checkOne(service) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATUS_TIMEOUT_MS);
  try {
    const res = await fetch(service.url, { method: 'GET', signal: controller.signal, redirect: 'follow' });
    statusCache.set(service.id, { ok: res.status < 500, code: res.status, checkedAt: Date.now() });
  } catch (err) {
    statusCache.set(service.id, { ok: false, code: null, checkedAt: Date.now() });
  } finally {
    clearTimeout(timer);
  }
}

async function refreshAllStatus() {
  const services = loadServices();
  await Promise.all(services.map(checkOne));
}

// --- routes ---
app.get('/api/services', (req, res) => {
  res.json(loadServices());
});

app.get('/api/categories', (req, res) => {
  const known = new Set(CATEGORY_RULES.map(([, c]) => c));
  loadServices().forEach((s) => known.add(s.category || 'Other'));
  known.add('Other');
  res.json([...known].sort());
});

app.post('/api/services', (req, res) => {
  const { name, url, category, icon, description, node } = req.body || {};
  if (!name || !url) {
    return res.status(400).json({ error: 'name and url are required' });
  }
  const services = loadServices();
  const service = {
    id: crypto.randomUUID(),
    name,
    url,
    category: category && category.trim() ? category.trim() : guessCategory(name, url),
    icon: icon || '',
    description: description || '',
    node: node || '',
  };
  services.push(service);
  saveServices(services);
  checkOne(service);
  res.status(201).json(service);
});

app.put('/api/services/:id', (req, res) => {
  const services = loadServices();
  const idx = services.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const { name, url, category, icon, description, node } = req.body || {};
  const existing = services[idx];
  const updated = {
    ...existing,
    name: name ?? existing.name,
    url: url ?? existing.url,
    category: category && category.trim() !== '' ? category.trim() : existing.category,
    icon: icon ?? existing.icon,
    description: description ?? existing.description,
    node: node ?? existing.node,
  };
  services[idx] = updated;
  saveServices(services);
  checkOne(updated);
  res.json(updated);
});

app.delete('/api/services/:id', (req, res) => {
  const services = loadServices();
  const next = services.filter((s) => s.id !== req.params.id);
  if (next.length === services.length) return res.status(404).json({ error: 'not found' });
  saveServices(next);
  statusCache.delete(req.params.id);
  res.status(204).end();
});

app.get('/api/status', (req, res) => {
  res.json(Object.fromEntries(statusCache));
});

app.post('/api/status/refresh', async (req, res) => {
  await refreshAllStatus();
  res.json(Object.fromEntries(statusCache));
});

// keep error responses JSON-only; never leak stack traces to clients
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: 'invalid request' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`homelab-dashboard listening on http://localhost:${PORT}`);
  refreshAllStatus();
  setInterval(refreshAllStatus, STATUS_REFRESH_MS);
});
