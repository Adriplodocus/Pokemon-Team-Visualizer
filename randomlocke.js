// ── i18n ─────────────────────────────────────────────
const STRINGS = {
    es: {
        capturedZonesTitle: 'Historial de zonas capturadas',
        searchZonePh:       'Buscar zona...',
        addZonePh:          'Añadir zona...',
        addZoneBtn:         '+ Añadir',
        showZonesBtn:       'Mostrar / buscar zonas',
        noRoutes:           'Sin zonas registradas.',
        lifeCounterTitle:   'Contador de vidas',
        overlayUrlPh:       'https://streamcounters.mrklypp.com/embed/...',
        counterUrlError:    'La URL debe ser de StreamCounters.',
        botTitle:           'Bot de Twitch',
        botDesc:            'El bot de Twitch responde al comando !check {zona}. Responderá si puedes o no capturar en la zona indicada. Añádelo como moderador en tu canal para que pueda escribir en el chat.',
        botDisconnected:    'Desactivado',
        botConnected:       'Activo',
        activateBot:        'Activar bot',
        deactivateBot:      'Desactivar bot',
        botHint:            'Responde a: !check <zona>',
        counterDesc:        'Necesitas crear un contador en <a href="https://streamcounters.mrklypp.com/" target="_blank" rel="noopener">StreamCounters</a> y pegar el enlace embed iframe aquí.',
        madeBy:             'Hecho por @MrKlypp',
        loginRequired:      'Inicia sesión para usar esta herramienta.',
        loginBtn:           'Iniciar sesión',
    },
    en: {
        capturedZonesTitle: 'Captured zones history',
        searchZonePh:       'Search zone...',
        addZonePh:          'Add zone...',
        addZoneBtn:         '+ Add',
        showZonesBtn:       'Show / search zones',
        noRoutes:           'No zones recorded.',
        lifeCounterTitle:   'Life counter',
        overlayUrlPh:       'https://streamcounters.mrklypp.com/embed/...',
        counterUrlError:    'URL must be from StreamCounters.',
        botTitle:           'Twitch bot',
        botDesc:            'The Twitch bot responds to the command !check {zone}. It will tell you whether you can capture in the specified zone. Add it as a moderator in your channel so it can write in chat.',
        botDisconnected:    'Inactive',
        botConnected:       'Active',
        activateBot:        'Activate bot',
        deactivateBot:      'Deactivate bot',
        botHint:            'Responds to: !check <zone>',
        counterDesc:        'You need to create a counter on <a href="https://streamcounters.mrklypp.com/" target="_blank" rel="noopener">StreamCounters</a> and paste the iframe embed link here.',
        madeBy:             'Made by @MrKlypp',
        loginRequired:      'Log in to use this tool.',
        loginBtn:           'Log in',
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
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const val = t(el.dataset.i18nHtml);
        if (val !== el.dataset.i18nHtml) el.innerHTML = val;
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

// ── Zones modal ───────────────────────────────────────
function openZonesModal() {
    document.getElementById('zones-modal').classList.remove('hidden');
    document.getElementById('route-search').focus();
}

function closeZonesModal() {
    document.getElementById('zones-modal').classList.add('hidden');
    document.getElementById('route-search').value = '';
    searchQuery = '';
    renderRoutes();
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

    const normalized = zone.toLowerCase().replace(/\s+/g, ' ');
    if (routes.some(r => r.zoneName.toLowerCase() === normalized)) {
        input.select();
        return;
    }

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

function isValidStreamCountersUrl(val) {
    try {
        const u = new URL(val);
        return u.hostname === 'streamcounters.mrklypp.com';
    } catch {
        return false;
    }
}

function applyCounterUrl(url) {
    const frame = document.getElementById('counter-frame');
    const error = document.getElementById('counter-url-error');
    if (!url) {
        frame.src = '';
        error.classList.add('hidden');
        return;
    }
    if (isValidStreamCountersUrl(url)) {
        frame.src = url;
        error.classList.add('hidden');
    } else {
        frame.src = '';
        error.classList.remove('hidden');
    }
}

function initLifeCounter() {
    const input = document.getElementById('counter-url');
    const saved = localStorage.getItem(COUNTER_URL_KEY) || '';
    input.value = saved;
    applyCounterUrl(saved);

    input.addEventListener('blur', () => {
        const url = input.value.trim();
        localStorage.setItem(COUNTER_URL_KEY, url);
        applyCounterUrl(url);
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

    document.getElementById('zones-modal-btn').addEventListener('click', openZonesModal);
    document.getElementById('zones-modal-close').addEventListener('click', closeZonesModal);
    document.getElementById('zones-modal').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeZonesModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeZonesModal();
    });
});

function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyLang();
    applyHeaderLang();
    setBotUI(botActive);
}
