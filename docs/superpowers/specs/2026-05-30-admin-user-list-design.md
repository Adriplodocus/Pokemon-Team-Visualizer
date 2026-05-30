# Admin User List — Design Spec
Date: 2026-05-30

## Summary

Add a paginated, sortable user list to `admin.html` with a total user count. Extends the existing `/api/admin/users` endpoint (makes `q` optional) rather than adding a new route.

---

## Backend

### `functions/api/admin/users.js`

**Changes:** Make `q` optional. Add `page`, `limit`, `sort` query params.

#### Query params

| Param  | Default | Valid values                    |
|--------|---------|----------------------------------|
| `q`    | —       | string — ILIKE filter on username/email |
| `page` | `1`     | positive integer                 |
| `limit`| `20`    | `10`, `20`, `25`, `50`, `0` (all) |
| `sort` | `asc`   | `asc` \| `desc` — orders by `username` |

#### SQL strategy

Single query using `COUNT(*) OVER()` window function to get total rows and data in one round-trip.

```sql
SELECT id, provider, username, email, avatar_url, tier, created_at,
       COUNT(*) OVER() AS total_count
FROM users
WHERE ($q IS NULL OR username ILIKE $q OR email ILIKE $q)
ORDER BY username ASC|DESC
LIMIT $limit OFFSET $offset
```

- `limit = 0` → `LIMIT NULL` (return all rows)
- `offset = (page - 1) * limit`, skipped when limit = 0

#### Response shape

```json
{
  "users": [
    { "id": "...", "provider": "twitch", "username": "foo", "email": "...", "avatar_url": "...", "tier": "guest", "created_at": "..." }
  ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

- `pages = ceil(total / limit)`, or `1` when `limit = 0`
- Auth: unchanged — `X-Admin-Key` header required

---

## Frontend

### `admin.html`

**No changes to:** existing search card, `setTier()`, `.user-row` CSS, `renderUserRow()`.

#### New card: "Todos los usuarios"

Inserted below the existing search card.

**Toolbar (single row):**
- Page size selector: `<select>` with options `10 | 20 | 25 | 50 | Todos`
- Sort toggle button: `A→Z` / `Z→A` — toggles `sort` state, re-fetches page 1
- User count badge: `142 usuarios` styled with `--blue` color

**User list:**
- Same `.user-row` markup and `renderUserRow()` function as search results
- Rendered into a new `#list-results` container

**Pagination bar:**
- `← Anterior | Página 3 de 8 | Siguiente →`
- Prev/Next are `<button>` elements, disabled at boundaries
- Hidden when: only 1 page total, or `limit = 0` (show all)

**State variables (JS):**
```js
let listPage  = 1;
let listLimit = 20;   // 10 | 20 | 25 | 50 | 0
let listSort  = 'asc';
```

**Auto-load:**
- `DOMContentLoaded` → if `sessionStorage` has `ptv_admin_key` → call `loadUsers()`
- Changing sort or limit → reset `listPage = 1` → call `loadUsers()`

**`loadUsers()` function:**
1. Read `listPage`, `listLimit`, `listSort`, key from sessionStorage
2. Build URL: `/api/admin/users?page=…&limit=…&sort=…` (append `&q=…` if search mode — not used here, list mode only)
3. Fetch with `X-Admin-Key` header
4. On success: render `#list-results`, update count badge, render pagination
5. On error: show error in `#list-status`

---

## Constraints

- Neon serverless tagged template SQL — parameterisation must use `${value}` interpolation, not `$1` positional params
- `sort` value must be validated server-side before interpolating into `ORDER BY` (whitelist `asc`/`desc` only)
- No new CSS files — inline `<style>` block in `admin.html`
- No build step — plain ES modules, no bundler

---

## Out of scope

- Sorting by columns other than `username`
- Filtering by tier or provider
- Bulk actions
- Export to CSV
