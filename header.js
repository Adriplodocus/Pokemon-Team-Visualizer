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
        initDonationBanner();
    });

    document.body.insertAdjacentHTML('afterbegin', `
<header>
    <h1>Pokémon Stream Visualizer<span class="app-badge app-badge--beta"><span class="app-badge-dot"></span>Beta</span></h1>
    <p class="subtitle" data-i18n-header="headerSubtitle">La herramienta definitiva para gestionar tu overlay de pokémon</p>
    <p class="header-error" data-i18n-header="headerError">¿Quieres notificar un error o dejar feedback? Puedes hacerlo a través de este <a href="https://forms.gle/x2AC4Xwb1w4ukJui6" target="_blank" rel="noopener">enlace</a>.</p>
    <div class="header-controls-row">
        <div class="mode-toggle">
            ${tabs}
        </div>
        <div class="lang-toggle">
            <button id="lang-es" onclick="setLang('es')">ES</button>
            <button id="lang-en" onclick="setLang('en')">EN</button>
        </div>
        <a href="https://pleasant-nerine-dc9.notion.site/Pok-mon-Stream-Visualizer-Gu-a-de-uso-383ca8d9d3fe80e8ab0cdbda2c106ded" target="_blank" rel="noopener" class="guide-btn" aria-label="Guía de uso"><svg class="guide-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n-header="guideBtn">Guía</span></a>
        <div class="user-widget" id="user-widget"></div>
    </div>
</header>`);
})();

const HEADER_STRINGS = {
    es: {
        headerSubtitle: 'La herramienta definitiva para gestionar tu overlay de pokémon',
        headerError: '¿Quieres notificar un error o dejar feedback? Puedes hacerlo a través de este <a href="https://forms.gle/x2AC4Xwb1w4ukJui6" target="_blank" rel="noopener">enlace</a>.',
        guideBtn: 'Guía',
        donationMsg: 'Este es un proyecto gratuito. Pero utiliza servicios de terceros que aplican barreras de pago (Cloudflare, Ably, Neon). Tu donación puede ayudar a mejorar los servicios prestados por la aplicación. Puedes realizar una donación <a href="https://www.paypal.com/paypalme/MrKlypp" target="_blank" rel="noopener">aquí</a>.',
    },
    en: {
        headerSubtitle: 'The ultimate tool to manage your Pokémon overlay',
        headerError: 'Want to report a bug or leave feedback? You can do so through this <a href="https://forms.gle/x2AC4Xwb1w4ukJui6" target="_blank" rel="noopener">link</a>.',
        guideBtn: 'Guide',
        donationMsg: 'This is a free project, but it relies on third-party services with paid tiers (Cloudflare, Ably, Neon). Your donation helps keep and improve the app. You can make a donation <a href="https://www.paypal.com/paypalme/MrKlypp" target="_blank" rel="noopener">here</a>.',
    },
};

function applyHeaderLang() {
    const s = HEADER_STRINGS[currentLang] || HEADER_STRINGS.es;
    document.querySelectorAll('[data-i18n-header]').forEach(el => {
        const key = el.dataset.i18nHeader;
        if (typeof s[key] === 'string') el.innerHTML = s[key];
    });
}

function initDonationBanner() {
    if (localStorage.getItem('ptv_donation_dismissed')) return;
    const banner = document.createElement('div');
    banner.className = 'donation-banner';
    banner.setAttribute('role', 'banner');
    const s = HEADER_STRINGS[currentLang] || HEADER_STRINGS.es;
    banner.innerHTML = `
        <div class="donation-banner-inner">
            <span class="donation-banner-icon" aria-hidden="true">★</span>
            <span data-i18n-header="donationMsg">${s.donationMsg}</span>
        </div>
        <button class="donation-banner-close" aria-label="Cerrar">✕</button>`;
    banner.querySelector('.donation-banner-close').addEventListener('click', () => {
        banner.remove();
        localStorage.setItem('ptv_donation_dismissed', '1');
    });
    const app = document.getElementById('app');
    const header = document.querySelector('header');
    if (app) app.insertAdjacentElement('afterbegin', banner);
    else if (header) header.insertAdjacentElement('afterend', banner);
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const _ME_CACHE_KEY = 'ptv_me_cache';
const _ME_TTL = 5 * 60 * 1000;

function clearAuthMeCache() {
    try { sessionStorage.removeItem(_ME_CACHE_KEY); } catch (_) {}
}

async function fetchAuthMe() {
    try {
        const cached = JSON.parse(sessionStorage.getItem(_ME_CACHE_KEY) || 'null');
        if (cached && (Date.now() - cached.ts) < _ME_TTL) return { ok: true, data: cached.data };
    } catch (_) {}
    const res = await fetch('/api/auth/me');
    if (res.ok) {
        const data = await res.json();
        try { sessionStorage.setItem(_ME_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
        return { ok: true, data };
    }
    clearAuthMeCache();
    return { ok: false, status: res.status };
}

async function initUserWidget() {
    const el = document.getElementById('user-widget');
    if (!el) return;
    try {
        const result = await fetchAuthMe();
        if (result.ok) {
            const { username, avatarUrl, tier } = result.data;
            const badgeClass = tier === 'vip' ? 'user-badge--vip' : 'user-badge--guest';
            const badgeLabel = tier === 'vip' ? 'VIP' : 'GUEST';
            el.innerHTML =
                (avatarUrl ? `<img class="user-avatar" src="${esc(avatarUrl)}" alt="${esc(username)}">` : '') +
                `<span class="user-name">${esc(username)}</span>` +
                `<span class="user-badge ${badgeClass}">${badgeLabel}</span>` +
                `<a href="/api/auth/logout" class="user-logout" onclick="clearAuthMeCache()">Salir</a>`;
        } else {
            console.error('[auth] /api/auth/me failed:', result.status);
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
