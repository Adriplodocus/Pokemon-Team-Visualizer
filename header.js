(function () {
    const icons = {
        pokemon:  '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h5.5M15.5 12H21" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
        cemetery: '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V10a6 6 0 0 1 12 0v11" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7v5M9.5 9.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 21h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        badges:   '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M9 14.5 7.5 21l4.5-2.5L16.5 21 15 14.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        types:    '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
    };

    const pages = [
        { id: 'pokemon',  href: 'index.html',    i18n: 'pokemonMode',  label: 'Pokémon' },
        { id: 'cemetery', href: 'cemetery.html', i18n: 'cemeteryMode', label: 'Cementerio' },
        { id: 'badges',   href: 'badges.html',   i18n: 'badgeMode',    label: 'Medallas' },
        { id: 'types',    href: 'types.html',    i18n: 'typesMode',    label: 'Tabla de tipos' },
    ];

    const tabs = pages.map(p =>
        `<a href="${p.href}" id="mode-btn-${p.id}" class="mode-btn${ACTIVE_PAGE === p.id ? ' active' : ''}" aria-label="${p.label}">${icons[p.id] || ''}<span class="mode-btn-text" data-i18n-badge="${p.i18n}">${p.label}</span></a>`
    ).join('\n            ');

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', `
<footer class="site-footer">
    <a href="https://mrklypp.com/" target="_blank" rel="noopener" data-i18n="madeBy">Hecho por @MrKlypp</a>
</footer>`);
        initUserWidget();
    });

    document.body.insertAdjacentHTML('afterbegin', `
<header>
    <h1>Pokémon Stream Visualizer</h1>
    <p class="subtitle" data-i18n-header="headerSubtitle">La herramienta definitiva para gestionar tu overlay de pokémon</p>
    <p class="header-error" data-i18n-header="headerError">Si encuentras algún error, <a href="mailto:MrKlypp@gmail.com">escríbeme</a>.</p>
    <div class="header-controls-row">
        <div class="mode-toggle">
            ${tabs}
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
        <div class="user-widget" id="user-widget"></div>
    </div>
</header>`);
})();

const HEADER_STRINGS = {
    es: {
        headerSubtitle: 'La herramienta definitiva para gestionar tu overlay de pokémon',
        headerError: 'Si encuentras algún error, <a href="mailto:MrKlypp@gmail.com">escríbeme</a>.',
    },
    en: {
        headerSubtitle: 'The ultimate tool to manage your Pokémon overlay',
        headerError: 'Found a bug? <a href="mailto:MrKlypp@gmail.com">Drop me a line</a>.',
    },
};

function applyHeaderLang() {
    const s = HEADER_STRINGS[currentLang] || HEADER_STRINGS.es;
    document.querySelectorAll('[data-i18n-header]').forEach(el => {
        const key = el.dataset.i18nHeader;
        if (typeof s[key] === 'string') el.innerHTML = s[key];
    });
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function initUserWidget() {
    const el = document.getElementById('user-widget');
    if (!el) return;
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const { username, avatarUrl, tier } = await res.json();
            const badgeClass = tier === 'vip' ? 'user-badge--vip' : 'user-badge--guest';
            const badgeLabel = tier === 'vip' ? 'VIP' : 'GUEST';
            el.innerHTML =
                (avatarUrl ? `<img class="user-avatar" src="${esc(avatarUrl)}" alt="${esc(username)}">` : '') +
                `<span class="user-name">${esc(username)}</span>` +
                `<span class="user-badge ${badgeClass}">${badgeLabel}</span>` +
                `<a href="/api/auth/logout" class="user-logout">Salir</a>`;
        } else {
            const body = await res.text().catch(() => '(no body)');
            console.error('[auth] /api/auth/me failed:', res.status, body);
            el.innerHTML = `<a href="/login.html" class="user-login-link">Login</a>`;
        }
    } catch (err) {
        console.error('[auth] /api/auth/me error:', err);
        el.innerHTML = `<a href="/login.html" class="user-login-link">Login</a>`;
    }
}

function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    window.location.href = 'index.html';
}
