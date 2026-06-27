(function () {
    const icons = {
        pokemon:  '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h5.5M15.5 12H21" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
        cemetery: '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V10a6 6 0 0 1 12 0v11" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7v5M9.5 9.5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 21h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        badges:   '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="9" r="6" stroke="currentColor" stroke-width="1.8"/><path d="M9 14.5 7.5 21l4.5-2.5L16.5 21 15 14.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
        types:    '<svg class="mode-btn-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V6M12 6C10 4.5 7 4.5 4 5v13c3-.5 6-.5 8 1M12 6c2-1.5 5-1.5 8-1v13c-2-.5-5-.5-8 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };

    const pages = [
        { id: 'pokemon',  href: 'index.html',    i18n: 'pokemonMode',  label: 'Pokémon' },
        { id: 'cemetery', href: 'cemetery.html', i18n: 'cemeteryMode', label: 'Cementerio' },
        { id: 'badges',   href: 'badges.html',   i18n: 'badgeMode',    label: 'Medallas' },
        { id: 'types',    href: 'types.html',    i18n: 'typesMode',    label: 'Pokédex' },
    ];

    const tabs = pages.map(p =>
        `<a href="${p.href}" id="mode-btn-${p.id}" class="mode-btn${ACTIVE_PAGE === p.id ? ' active' : ''}" aria-label="${p.label}">${icons[p.id] || ''}<span class="mode-btn-text" data-i18n-badge="${p.i18n}">${p.label}</span></a>`
    ).join('\n            ');

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', `
<footer class="site-footer">
    <a href="https://mrklypp.com/" target="_blank" rel="noopener" data-i18n="madeBy">⚡ Hecho por @MrKlypp ↗</a>
</footer>`);
        initUserWidget();
        initDonationBanner();
        initPatchNotesBanner();
        initPromoBanner();
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
        patchNew: 'NOVEDAD',
        patchUpdates: 'novedades',
        patchClose: 'Cerrar novedad',
        headerSubtitle: 'La herramienta definitiva para gestionar tu overlay de pokémon',
        headerError: '¿Quieres notificar un error o dejar feedback? Puedes hacerlo a través de este <a href="https://forms.gle/x2AC4Xwb1w4ukJui6" target="_blank" rel="noopener">enlace</a>.',
        guideBtn: 'Guía',
        donationMsg: 'Este es un proyecto gratuito. Pero utiliza servicios de terceros que aplican barreras de pago (Cloudflare, Ably, Neon). Tu donación puede ayudar a mejorar los servicios prestados por la aplicación. Puedes realizar una donación <a href="https://www.paypal.com/paypalme/MrKlypp" target="_blank" rel="noopener">aquí</a>.',
        promoTitle: '¿Te está gustando Pokémon Stream Visualizer?',
        promoSubtitle: 'Encuentra más apps y sígueme en mis redes',
        promoAppsBtn: 'Ver apps →',
        promoClose: 'Cerrar',
    },
    en: {
        patchNew: 'NEW',
        patchUpdates: 'updates',
        patchClose: 'Close update',
        headerSubtitle: 'The ultimate tool to manage your Pokémon overlay',
        headerError: 'Want to report a bug or leave feedback? You can do so through this <a href="https://forms.gle/x2AC4Xwb1w4ukJui6" target="_blank" rel="noopener">link</a>.',
        guideBtn: 'Guide',
        donationMsg: 'This is a free project, but it relies on third-party services with paid tiers (Cloudflare, Ably, Neon). Your donation helps keep and improve the app. You can make a donation <a href="https://www.paypal.com/paypalme/MrKlypp" target="_blank" rel="noopener">here</a>.',
        promoTitle: 'Enjoying Pokémon Stream Visualizer?',
        promoSubtitle: 'Find more apps and follow me on socials',
        promoAppsBtn: 'See apps →',
        promoClose: 'Close',
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

function initPatchNotesBanner() {
    if (typeof PATCH_NOTES === 'undefined' || !PATCH_NOTES.length) return;

    let seen;
    try { seen = JSON.parse(localStorage.getItem('ptv_seen_patches') || '[]'); }
    catch (_) { seen = []; }

    const pending = PATCH_NOTES
        .filter(n => !seen.includes(n.id))
        .sort((a, b) => {
            const p = d => { const [dd,mm,yy] = d.split('/'); return new Date(yy, mm-1, dd); };
            return p(b.date) - p(a.date);
        });

    if (!pending.length) return;

    let idx = 0;
    const seenLocal = [...seen];

    const banner = document.createElement('div');
    banner.className = 'patch-banner patch-banner--conic';
    banner.setAttribute('role', 'status');

    function renderNote() {
        const note = pending[idx];
        const lang = currentLang || 'es';
        const s = HEADER_STRINGS[lang] || HEADER_STRINGS.es;
        const total = pending.length;
        const counterHtml = total > 1
            ? `<span class="patch-banner-counter">${idx + 1} / ${total} ${s.patchUpdates}</span>`
            : '';
        banner.innerHTML = `
            <div class="patch-banner-inner">
                <span class="patch-banner-icon" aria-hidden="true">⚡</span>
                <div class="patch-banner-content">
                    <div class="patch-banner-header">
                        <span class="patch-banner-tag">${esc(s.patchNew)}</span>
                        <strong class="patch-banner-title">${esc(note.title[lang] || note.title.es)}</strong>
                    </div>
                    <span class="patch-banner-body">${esc(note.body[lang] || note.body.es)}</span>
                </div>
            </div>
            <div class="patch-banner-actions">
                ${counterHtml}
                <button class="patch-banner-close" aria-label="${esc(s.patchClose)}">✕</button>
            </div>`;
        banner.querySelector('.patch-banner-close').addEventListener('click', dismissNote);
    }

    function dismissNote() {
        seenLocal.push(pending[idx].id);
        try { localStorage.setItem('ptv_seen_patches', JSON.stringify(seenLocal)); } catch (_) {}
        idx++;
        if (idx < pending.length) {
            banner.style.opacity = '0';
            setTimeout(() => { banner.style.opacity = ''; renderNote(); }, 150);
        } else {
            banner.remove();
        }
    }

    renderNote();

    const ref = document.querySelector('.donation-banner');
    const app = document.getElementById('app');
    const hdr = document.querySelector('header');
    if (ref)      ref.insertAdjacentElement('afterend', banner);
    else if (app) app.insertAdjacentElement('afterbegin', banner);
    else if (hdr) hdr.insertAdjacentElement('afterend', banner);
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const _ME_CACHE_KEY = 'ptv_me_cache';
const _ME_TTL = 30 * 60 * 1000;

function clearAuthMeCache() {
    try { localStorage.removeItem(_ME_CACHE_KEY); } catch (_) {}
}

async function fetchAuthMe() {
    try {
        const cached = JSON.parse(localStorage.getItem(_ME_CACHE_KEY) || 'null');
        if (cached && (Date.now() - cached.ts) < _ME_TTL) return { ok: true, data: cached.data };
    } catch (_) {}
    const res = await fetch('/api/auth/me');
    if (res.ok) {
        const data = await res.json();
        try { localStorage.setItem(_ME_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
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

const PROMO_CLICKS_REQUIRED = 5;

function initPromoBanner() {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('ptv_promo_last_shown') === today) return;

    let clicks = 0;

    function onDocClick(e) {
        if (document.getElementById('promo-toast')?.contains(e.target)) return;
        clicks++;
        if (clicks >= PROMO_CLICKS_REQUIRED) {
            document.removeEventListener('click', onDocClick, true);
            showPromoBanner(today);
        }
    }

    document.addEventListener('click', onDocClick, true);
}

function showPromoBanner(today) {
    try {
        const sfx = new Audio('sounds/toast.mp3');
        sfx.volume = 0.6;
        sfx.play().catch(() => {});
    } catch (_) {}

    const s = HEADER_STRINGS[currentLang] || HEADER_STRINGS.es;

    const socials = [
        {
            href: 'https://www.twitch.tv/MrKlypp', label: 'Twitch', color: '#9147FF',
            svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
        },
        {
            href: 'https://www.youtube.com/@MrKlypp', label: 'YouTube', color: '#FF0000',
            svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>',
        },
        {
            href: 'https://www.instagram.com/MrKlypp_', label: 'Instagram', color: 'var(--accent)',
            svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
        },
        {
            href: 'https://www.tiktok.com/@mrklypp', label: 'TikTok', color: 'var(--text)',
            svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
        },
    ];

    const socialsHtml = socials.map(n =>
        `<a href="${n.href}" target="_blank" rel="noopener" class="promo-toast-social" style="--social-color:${n.color}" aria-label="${esc(n.label)}">${n.svg}</a>`
    ).join('');

    const toast = document.createElement('div');
    toast.id = 'promo-toast';
    toast.className = 'promo-toast';
    toast.setAttribute('role', 'complementary');
    toast.innerHTML = `
        <button class="promo-toast-close" id="promo-toast-close" disabled aria-label="${esc(s.promoClose)}">
            <span id="promo-toast-countdown">5</span>
        </button>
        <p class="promo-toast-title">${esc(s.promoTitle)}</p>
        <p class="promo-toast-subtitle">${esc(s.promoSubtitle)}</p>
        <div class="promo-toast-socials">${socialsHtml}</div>
        <a href="https://mrklypp.com/#apps" target="_blank" rel="noopener" class="promo-toast-apps-btn">${esc(s.promoAppsBtn)}</a>
    `;

    document.body.appendChild(toast);

    const closeBtn = document.getElementById('promo-toast-close');
    const countdownEl = document.getElementById('promo-toast-countdown');
    let remaining = 5;

    const timer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(timer);
            countdownEl.textContent = '✕';
            closeBtn.disabled = false;
            closeBtn.classList.add('promo-toast-close--ready');
        } else {
            countdownEl.textContent = remaining;
        }
    }, 1000);

    closeBtn.addEventListener('click', () => {
        clearInterval(timer);
        toast.classList.add('promo-toast--out');
        setTimeout(() => toast.remove(), 250);
        try { localStorage.setItem('ptv_promo_last_shown', today); } catch (_) {}
    });
}
