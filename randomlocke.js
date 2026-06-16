// ── i18n ─────────────────────────────────────────────
const STRINGS = {
    es: {
        routeHistoryTitle: 'Historial de rutas',
        searchZonePh:      'Buscar zona...',
        addZonePh:         'Añadir zona...',
        addZoneBtn:        '+ Añadir',
        noRoutes:          'Sin rutas registradas.',
        lifeCounterTitle:  'Contador de vidas',
        overlayUrlLabel:   'URL del overlay',
        overlayUrlPh:      'https://...',
        botTitle:          'Bot de Twitch',
        botDisconnected:   'Desactivado',
        botConnected:      'Activo',
        activateBot:       'Activar bot',
        deactivateBot:     'Desactivar bot',
        botHint:           'Responde a: !check <zona>',
        loginRequired:     'Inicia sesión para usar esta herramienta.',
        loginBtn:          'Iniciar sesión',
    },
    en: {
        routeHistoryTitle: 'Route history',
        searchZonePh:      'Search zone...',
        addZonePh:         'Add zone...',
        addZoneBtn:        '+ Add',
        noRoutes:          'No routes recorded.',
        lifeCounterTitle:  'Life counter',
        overlayUrlLabel:   'Overlay URL',
        overlayUrlPh:      'https://...',
        botTitle:          'Twitch bot',
        botDisconnected:   'Inactive',
        botConnected:      'Active',
        activateBot:       'Activate bot',
        deactivateBot:     'Deactivate bot',
        botHint:           'Responds to: !check <zone>',
        loginRequired:     'Log in to use this tool.',
        loginBtn:          'Log in',
    },
};

function t(key) {
    return (STRINGS[currentLang] || STRINGS.es)[key] || key;
}

function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPh);
    });
}

// ── State ─────────────────────────────────────────────
let routes = [];
let searchQuery = '';
let botActive = false;

// ── Auth gate ─────────────────────────────────────────
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error();
        const user = await res.json();
        document.getElementById('auth-gate').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('bot-channel-label').textContent = `#${user.username}`;
        return user;
    } catch {
        document.getElementById('auth-gate').classList.remove('hidden');
        document.getElementById('main-content').classList.add('hidden');
        return null;
    }
}

// ── Route history ─────────────────────────────────────
async function loadRoutes() {
    try {
        const res = await fetch('/api/randomlocke/routes');
        if (!res.ok) throw new Error();
        routes = await res.json();
        renderRoutes();
    } catch (e) {
        console.error('Failed to load routes', e);
    }
}

function renderRoutes() {
    const list = document.getElementById('route-list');
    const empty = document.getElementById('route-empty');
    const query = searchQuery.toLowerCase();

    const filtered = query
        ? routes.filter(r => r.zoneName.toLowerCase().includes(query))
        : routes;

    if (!filtered.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    list.innerHTML = filtered.map(r => `
        <li data-id="${r.id}">
            <span>${escapeHtml(r.zoneName)}</span>
            <button onclick="deleteRoute('${r.id}')" title="Eliminar">✕</button>
        </li>
    `).join('');
}

async function addRoute() {
    const input = document.getElementById('route-input');
    const zone = input.value.trim();
    if (!zone) return;

    try {
        const res = await fetch('/api/randomlocke/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zone }),
        });
        if (!res.ok) throw new Error();
        const newRoute = await res.json();
        routes.unshift(newRoute);
        input.value = '';
        renderRoutes();
    } catch (e) {
        console.error('Failed to add route', e);
    }
}

async function deleteRoute(id) {
    try {
        const res = await fetch(`/api/randomlocke/routes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        routes = routes.filter(r => r.id !== id);
        renderRoutes();
    } catch (e) {
        console.error('Failed to delete route', e);
    }
}

// ── Life counter ──────────────────────────────────────
const COUNTER_URL_KEY = 'ptv_streamcounters_url';

function initLifeCounter() {
    const input = document.getElementById('counter-url');
    const frame = document.getElementById('counter-frame');
    const saved = localStorage.getItem(COUNTER_URL_KEY) || '';
    input.value = saved;
    if (saved) frame.src = saved;

    input.addEventListener('blur', () => {
        const url = input.value.trim();
        localStorage.setItem(COUNTER_URL_KEY, url);
        frame.src = url;
    });
}

// ── Bot ───────────────────────────────────────────────
async function loadBotStatus() {
    try {
        const res = await fetch('/api/randomlocke/bot/status');
        if (!res.ok) throw new Error();
        const { connected } = await res.json();
        setBotUI(connected);
    } catch {
        setBotUI(false);
    }
}

function setBotUI(active) {
    botActive = active;
    const dot = document.getElementById('bot-dot');
    const label = document.getElementById('bot-status-label');
    const btn = document.getElementById('bot-toggle-btn');

    dot.style.background = active ? '#22C55E' : 'var(--dimmed)';
    label.textContent = t(active ? 'botConnected' : 'botDisconnected');
    btn.textContent = t(active ? 'deactivateBot' : 'activateBot');
}

async function toggleBot() {
    const btn = document.getElementById('bot-toggle-btn');
    btn.disabled = true;
    try {
        const endpoint = botActive ? '/api/randomlocke/bot/stop' : '/api/randomlocke/bot/start';
        const res = await fetch(endpoint, { method: 'POST' });
        if (!res.ok) throw new Error();
        setBotUI(!botActive);
    } catch (e) {
        console.error('Bot toggle failed', e);
    } finally {
        btn.disabled = false;
    }
}

// ── Utils ─────────────────────────────────────────────
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    applyLang();
    const user = await checkAuth();
    if (!user) return;

    loadRoutes();
    initLifeCounter();
    loadBotStatus();

    document.getElementById('route-add-btn').addEventListener('click', addRoute);
    document.getElementById('route-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addRoute();
    });
    document.getElementById('route-search').addEventListener('input', e => {
        searchQuery = e.target.value;
        renderRoutes();
    });
    document.getElementById('bot-toggle-btn').addEventListener('click', toggleBot);
});

function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyLang();
    applyHeaderLang();
}
