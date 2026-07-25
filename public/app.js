const board = document.getElementById('board');
const emptyMsg = document.getElementById('empty');
const searchInput = document.getElementById('search');
const addBtn = document.getElementById('addBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const serviceForm = document.getElementById('serviceForm');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const categoryList = document.getElementById('categoryList');

const fId = document.getElementById('serviceId');
const fName = document.getElementById('fName');
const fUrl = document.getElementById('fUrl');
const fCategory = document.getElementById('fCategory');
const fIcon = document.getElementById('fIcon');
const fNode = document.getElementById('fNode');
const fDescription = document.getElementById('fDescription');

let services = [];
let statuses = {};
let searchTerm = '';

async function loadAll() {
  const [servicesRes, categoriesRes, statusRes] = await Promise.all([
    fetch('/api/services').then((r) => r.json()),
    fetch('/api/categories').then((r) => r.json()),
    fetch('/api/status').then((r) => r.json()),
  ]);
  services = servicesRes;
  statuses = statusRes;
  categoryList.innerHTML = categoriesRes.map((c) => `<option value="${escapeHtml(c)}">`).join('');
  render();
}

async function refreshStatus() {
  statuses = await fetch('/api/status').then((r) => r.json());
  render();
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function render() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = services.filter((s) =>
    !term ||
    s.name.toLowerCase().includes(term) ||
    (s.category || '').toLowerCase().includes(term) ||
    (s.description || '').toLowerCase().includes(term) ||
    (s.node || '').toLowerCase().includes(term)
  );

  emptyMsg.classList.toggle('hidden', services.length > 0);
  board.innerHTML = '';

  if (filtered.length === 0) {
    if (services.length > 0 && term) {
      board.innerHTML = '<p class="empty">No matches.</p>';
    }
    return;
  }

  const groups = new Map();
  filtered.forEach((s) => {
    const cat = s.category || 'Other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(s);
  });

  [...groups.keys()].sort().forEach((cat) => {
    const section = document.createElement('section');
    section.className = 'category';
    const items = groups.get(cat).sort((a, b) => a.name.localeCompare(b.name));

    section.innerHTML = `
      <h2 class="category-title">${escapeHtml(cat)} · ${items.length}</h2>
      <div class="grid">
        ${items.map(renderCard).join('')}
      </div>
    `;
    board.appendChild(section);
  });

  board.querySelectorAll('[data-edit-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openEdit(btn.dataset.editId);
    });
  });
}

function renderCard(s) {
  const status = statuses[s.id];
  const statusClass = status ? (status.ok ? 'ok' : 'down') : '';
  const icon = s.icon && s.icon.trim() ? s.icon : '🔗';
  return `
    <a class="card" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">
      <button class="card-edit" data-edit-id="${s.id}" title="Edit">✎</button>
      <div class="card-top">
        <span class="card-icon">${icon}</span>
        <span class="status-dot ${statusClass}" title="${status ? (status.ok ? 'Online' : 'Unreachable') : 'Unknown'}"></span>
      </div>
      <p class="card-name">${escapeHtml(s.name)}</p>
      ${s.description ? `<p class="card-desc">${escapeHtml(s.description)}</p>` : ''}
      <div class="card-meta">
        <span>${escapeHtml(s.node || '')}</span>
      </div>
    </a>
  `;
}

function openAdd() {
  modalTitle.textContent = 'Add service';
  serviceForm.reset();
  fId.value = '';
  deleteBtn.classList.add('hidden');
  modalOverlay.classList.remove('hidden');
  fName.focus();
}

function openEdit(id) {
  const s = services.find((x) => x.id === id);
  if (!s) return;
  modalTitle.textContent = 'Edit service';
  fId.value = s.id;
  fName.value = s.name;
  fUrl.value = s.url;
  fCategory.value = s.category || '';
  fIcon.value = s.icon || '';
  fNode.value = s.node || '';
  fDescription.value = s.description || '';
  deleteBtn.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
  fName.focus();
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

addBtn.addEventListener('click', openAdd);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  render();
});

serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: fName.value.trim(),
    url: fUrl.value.trim(),
    category: fCategory.value.trim(),
    icon: fIcon.value.trim(),
    node: fNode.value.trim(),
    description: fDescription.value.trim(),
  };
  const id = fId.value;
  const res = await fetch(id ? `/api/services/${id}` : '/api/services', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    alert('Failed to save service.');
    return;
  }
  closeModal();
  await loadAll();
});

deleteBtn.addEventListener('click', async () => {
  const id = fId.value;
  if (!id) return;
  if (!confirm('Delete this service?')) return;
  await fetch(`/api/services/${id}`, { method: 'DELETE' });
  closeModal();
  await loadAll();
});

loadAll();
setInterval(refreshStatus, 30000);
