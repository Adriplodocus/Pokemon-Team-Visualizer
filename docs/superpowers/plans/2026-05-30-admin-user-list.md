# Admin User List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a paginated, sortable user list with a total count to `admin.html`, backed by an extended `/api/admin/users` endpoint.

**Architecture:** Extend the existing GET `/api/admin/users` to make `q` optional and add `page`, `limit`, `sort` params. A new "Todos los usuarios" card in `admin.html` auto-loads on page open (if Admin Key is saved), renders rows using the existing `renderUserRow()`, and shows a pagination bar + count badge.

**Tech Stack:** Cloudflare Pages Functions, `@neondatabase/serverless` (Neon tagged-template SQL), vanilla JS, inline CSS.

---

## Files

| File | Change |
|---|---|
| `functions/api/admin/users.js` | Full rewrite — make `q` optional, add pagination/sort/count |
| `admin.html` | Add CSS (toolbar + pagination), new HTML card, new JS block |

---

## Task 1: Rewrite `/api/admin/users.js`

**Files:**
- Modify: `functions/api/admin/users.js`

The Neon `sql` tag parameterises every `${}` interpolation, so `ORDER BY username ${sort}` would pass `'asc'` as a SQL parameter — invalid. Instead, call `sql` as a plain function: `sql(queryText, paramsArray)`. This supports the same parameterisation but lets us build `queryText` dynamically. `sortDir` is whitelisted before injection.

- [ ] **Step 1: Replace the file contents**

```js
import { getDB } from '../_lib/db.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const ALLOWED_LIMITS = new Set([10, 20, 25, 50, 0]);

export async function onRequestGet(context) {
  const adminKey = context.request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== context.env.ADMIN_KEY) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url    = new URL(context.request.url);
  const q      = url.searchParams.get('q')?.trim() || null;
  const sort   = url.searchParams.get('sort') === 'desc' ? 'DESC' : 'ASC';
  const limit  = (() => {
    const v = parseInt(url.searchParams.get('limit'), 10);
    return ALLOWED_LIMITS.has(v) ? v : 20;
  })();
  const page   = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
  const offset = limit === 0 ? 0 : (page - 1) * limit;

  let rows;
  try {
    const sql    = getDB(context.env);
    const params = [];
    let   query  = `
      SELECT id, provider, username, email, avatar_url, tier, created_at,
             COUNT(*) OVER()::int AS total_count
      FROM users
    `;

    if (q) {
      params.push('%' + q + '%');
      query += ` WHERE username ILIKE $${params.length} OR email ILIKE $${params.length}`;
    }

    query += ` ORDER BY username ${sort}`;

    if (limit > 0) {
      params.push(limit);
      query += ` LIMIT $${params.length}`;
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

    rows = await sql(query, params);
  } catch (e) {
    console.error('DB error in /admin/users', e);
    return json({ error: 'Database error' }, 500);
  }

  const total = rows.length > 0 ? rows[0].total_count : 0;
  const pages = limit === 0 ? 1 : Math.ceil(total / limit) || 1;

  return json({
    users: rows.map(({ total_count, ...u }) => u),
    total,
    page,
    limit,
    pages,
  });
}
```

- [ ] **Step 2: Start local dev server and verify endpoint**

```
npx wrangler pages dev . --binding ABLY_API_KEY=dummy --binding ADMIN_KEY=testkey --binding DATABASE_URL=<your-neon-url>
```

Then test with curl (replace `testkey` with your actual local key):

```bash
# List all users, page 1, limit 20, sort asc
curl -s "http://localhost:8788/api/admin/users?limit=20&page=1&sort=asc" \
  -H "X-Admin-Key: testkey" | jq .

# Expected: { users: [...], total: <N>, page: 1, limit: 20, pages: <N> }

# Search mode still works
curl -s "http://localhost:8788/api/admin/users?q=ash&limit=20&page=1" \
  -H "X-Admin-Key: testkey" | jq .

# No key → 401
curl -s "http://localhost:8788/api/admin/users" | jq .
# Expected: { error: "Unauthorized" }

# limit=0 → returns all, pages=1
curl -s "http://localhost:8788/api/admin/users?limit=0&sort=desc" \
  -H "X-Admin-Key: testkey" | jq '{total:.total, pages:.pages, count:(.users|length)}'
```

- [ ] **Step 3: Commit**

```bash
git add functions/api/admin/users.js
git commit -m "feat(admin): extend /api/admin/users — pagination, sort, count"
```

---

## Task 2: Add CSS and HTML card to `admin.html`

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add CSS for toolbar, count badge, and pagination**

In `admin.html`, inside the existing `<style>` block, append after the last rule (`.status-msg` / `#search-results`):

```css
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.list-count {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--cyan);
  background: rgba(0,204,255,0.10);
  border: 1px solid rgba(0,204,255,0.25);
  border-radius: 100px;
  padding: 0.2rem 0.65rem;
  letter-spacing: 0.03em;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-2);
}
.pagination button {
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s;
}
.pagination button:hover:not(:disabled) { border-color: rgba(0,204,255,0.3); }
.pagination button:disabled { opacity: 0.35; cursor: default; }
#list-results { display: flex; flex-direction: column; gap: 0.5rem; }
```

- [ ] **Step 2: Add the new HTML card**

In `admin.html`, after the closing `</div>` of the search card (the one containing `id="search-results"`), insert:

```html
<div class="card">
  <div class="admin-section">
    <div class="list-toolbar">
      <label class="admin-label" style="margin:0">Por página:</label>
      <select class="tier-select" id="list-limit" onchange="onLimitChange()">
        <option value="10">10</option>
        <option value="20" selected>20</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="0">Todos</option>
      </select>
      <button class="admin-btn" id="sort-btn" onclick="onSortToggle()">A→Z</button>
      <span class="list-count" id="list-count" style="display:none">— usuarios</span>
    </div>
    <div id="list-status" class="status-msg"></div>
    <div id="list-results"></div>
    <div class="pagination" id="list-pagination" style="display:none">
      <button id="page-prev" onclick="onPagePrev()">← Anterior</button>
      <span id="page-info">Página 1 de 1</span>
      <button id="page-next" onclick="onPageNext()">Siguiente →</button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify markup renders**

Open `admin.html` in a browser (static, no server needed). Confirm:
- New card visible below the search card
- Toolbar shows "Por página" select, "A→Z" button, count badge (hidden)
- No JS errors in console

- [ ] **Step 4: Commit**

```bash
git add admin.html
git commit -m "feat(admin): add user list card — toolbar, results, pagination markup"
```

---

## Task 3: Add JavaScript for the user list

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add state variables and `loadUsers()`**

In `admin.html`, inside the `<script>` block, add after the `const TIERS = ...` line:

```js
let listPage  = 1;
let listLimit = 20;
let listSort  = 'asc';

async function loadUsers() {
  const key      = getKey();
  const statusEl = document.getElementById('list-status');
  const countEl  = document.getElementById('list-count');

  if (!key) return;

  statusEl.textContent = 'Cargando...';
  statusEl.className   = 'status-msg';

  const params = new URLSearchParams({
    page:  listPage,
    limit: listLimit,
    sort:  listSort,
  });
  const res = await fetch(`/api/admin/users?${params}`, {
    headers: { 'X-Admin-Key': key },
  }).catch(() => null);

  if (!res || !res.ok) {
    const data = res ? await res.json().catch(() => ({})) : {};
    statusEl.textContent = `Error: ${data.error || 'Sin respuesta'}`;
    statusEl.className   = 'status-msg err';
    return;
  }

  const { users, total, page, pages } = await res.json();

  statusEl.textContent = '';
  countEl.textContent  = `${total} usuario${total !== 1 ? 's' : ''}`;
  countEl.style.display = '';

  document.getElementById('list-results').innerHTML =
    users.length ? users.map(u => renderUserRow(u)).join('') : '<div class="status-msg">Sin usuarios.</div>';

  renderPagination(page, pages);
}
```

- [ ] **Step 2: Add `renderPagination()`**

Still inside the `<script>` block, after `loadUsers`:

```js
function renderPagination(page, pages) {
  const bar      = document.getElementById('list-pagination');
  const prevBtn  = document.getElementById('page-prev');
  const nextBtn  = document.getElementById('page-next');
  const infoEl   = document.getElementById('page-info');

  if (pages <= 1 || listLimit === 0) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display    = '';
  infoEl.textContent   = `Página ${page} de ${pages}`;
  prevBtn.disabled     = page <= 1;
  nextBtn.disabled     = page >= pages;
}
```

- [ ] **Step 3: Add event handlers**

Still inside the `<script>` block:

```js
function onSortToggle() {
  listSort = listSort === 'asc' ? 'desc' : 'asc';
  document.getElementById('sort-btn').textContent = listSort === 'asc' ? 'A→Z' : 'Z→A';
  listPage = 1;
  loadUsers();
}

function onLimitChange() {
  listLimit = parseInt(document.getElementById('list-limit').value, 10);
  listPage  = 1;
  loadUsers();
}

function onPagePrev() {
  if (listPage > 1) { listPage--; loadUsers(); }
}

function onPageNext() {
  listPage++;
  loadUsers();
}
```

- [ ] **Step 4: Update `DOMContentLoaded` to auto-load**

Find the existing `window.addEventListener('DOMContentLoaded', ...)` block. It currently ends with:
```js
  fetch('/api/auth/me').then(r => {
    if (r.status === 401) window.location.href = '/';
  }).catch(() => {});
```

Add `loadUsers();` after the sessionStorage key restore block, so the full listener becomes:

```js
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('ptv_admin_key');
  if (saved) {
    document.getElementById('admin-key-input').value = saved;
    document.getElementById('key-status').textContent = 'Key cargada de sesión.';
    document.getElementById('key-status').className   = 'status-msg ok';
    loadUsers();
  }
  fetch('/api/auth/me').then(r => {
    if (r.status === 401) window.location.href = '/';
  }).catch(() => {});
});
```

- [ ] **Step 5: Verify end-to-end in browser**

Start: `npx wrangler pages dev . --binding ABLY_API_KEY=dummy --binding ADMIN_KEY=testkey --binding DATABASE_URL=<url>`

Open `http://localhost:8788/admin`.

Checklist:
- [ ] Enter Admin Key and click Guardar → list auto-loads
- [ ] Count badge shows correct number (e.g. "14 usuarios")
- [ ] Rows render with avatar, username, tier selector, Guardar button
- [ ] Sort button starts "A→Z", click → becomes "Z→A", list re-sorts
- [ ] Change page size to 10 → reloads with 10 rows, pagination appears if >10 total
- [ ] Change page size to "Todos" → all rows load, pagination hidden
- [ ] Pagination Anterior/Siguiente navigate correctly, disabled at boundaries
- [ ] Existing search card still works independently
- [ ] `setTier()` Guardar still works on list rows

- [ ] **Step 6: Commit**

```bash
git add admin.html
git commit -m "feat(admin): user list — auto-load, pagination, sort, count badge"
```
