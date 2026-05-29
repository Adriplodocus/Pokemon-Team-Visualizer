// ── Constants ────────────────────────────────────────────────────
const GAME_TO_REGION = {
    'pokemon-rojo':               'Kanto',
    'pokemon-azul':               'Kanto',
    'pokemon-amarillo':           'Kanto',
    'pokemon-rojo-fuego':         'Kanto',
    'pokemon-verde-hoja':         'Kanto',
    'pokemon-lets-go-pikachu':    'Kanto',
    'pokemon-lets-go-eevee':      'Kanto',
    'pokemon-anil':               'Kanto',
    'pokemon-oro':                'Johto',
    'pokemon-plata':              'Johto',
    'pokemon-cristal':            'Johto',
    'pokemon-soulsilver':         'Johto',
    'pokemon-heartgold':          'Johto',
    'pokemon-rubi':               'Hoenn',
    'pokemon-zafiro':             'Hoenn',
    'pokemon-esmeralda':          'Hoenn',
    'pokemon-rubi-omega':         'Hoenn',
    'pokemon-zafiro-alfa':        'Hoenn',
    'pokemon-diamante':           'Sinnoh',
    'pokemon-perla':              'Sinnoh',
    'pokemon-platino':            'Sinnoh',
    'pokemon-diamante-brillante': 'Sinnoh',
    'pokemon-perla-reluciente':   'Sinnoh',
    'pokemon-negro':              'Unova1',
    'pokemon-blanco':             'Unova1',
    'pokemon-negro-2':            'Unova2',
    'pokemon-blanco-2':           'Unova2',
    'pokemon-x':                  'Kalos',
    'pokemon-y':                  'Kalos',
    'pokemon-espada':             'Galar',
    'pokemon-escudo':             'Galar',
    'pokemon-escarlata':          'Paldea',
    'pokemon-purpura':            'Paldea',
};

const REGION_DATA = {
    Kanto:  { count: 8 },
    Johto:  { count: 8 },
    Hoenn:  { count: 8 },
    Sinnoh: { count: 8 },
    Unova1: { count: 8 },
    Unova2: { count: 8 },
    Kalos:  { count: 8 },
    Galar:  { count: 10 },
    Paldea: { count: 8 },
};

const BADGE_GAMES = [
    { region: 'Kanto', labels: { es: 'Kanto', en: 'Kanto' }, games: [
        ['pokemon-rojo',            { es: 'Pokémon Rojo',       en: 'Pokémon Red' }],
        ['pokemon-azul',            { es: 'Pokémon Azul',       en: 'Pokémon Blue' }],
        ['pokemon-amarillo',        { es: 'Pokémon Amarillo',   en: 'Pokémon Yellow' }],
        ['pokemon-rojo-fuego',      { es: 'Pokémon Rojo Fuego', en: 'Pokémon FireRed' }],
        ['pokemon-verde-hoja',      { es: 'Pokémon Verde Hoja', en: 'Pokémon LeafGreen' }],
        ['pokemon-lets-go-pikachu', { es: "Pokémon: Let's Go, Pikachu!", en: "Pokémon: Let's Go, Pikachu!" }],
        ['pokemon-lets-go-eevee',   { es: "Pokémon: Let's Go, Eevee!",   en: "Pokémon: Let's Go, Eevee!" }],
        ['pokemon-anil',            { es: 'Pokémon Añil',                 en: 'Pokémon Añil' }],
    ]},
    { region: 'Johto', labels: { es: 'Johto', en: 'Johto' }, games: [
        ['pokemon-oro',        { es: 'Pokémon Oro',       en: 'Pokémon Gold' }],
        ['pokemon-plata',      { es: 'Pokémon Plata',     en: 'Pokémon Silver' }],
        ['pokemon-cristal',    { es: 'Pokémon Cristal',   en: 'Pokémon Crystal' }],
        ['pokemon-soulsilver', { es: 'Pokémon SoulSilver', en: 'Pokémon SoulSilver' }],
        ['pokemon-heartgold',  { es: 'Pokémon HeartGold',  en: 'Pokémon HeartGold' }],
    ]},
    { region: 'Hoenn', labels: { es: 'Hoenn', en: 'Hoenn' }, games: [
        ['pokemon-rubi',        { es: 'Pokémon Rubí',         en: 'Pokémon Ruby' }],
        ['pokemon-zafiro',      { es: 'Pokémon Zafiro',       en: 'Pokémon Sapphire' }],
        ['pokemon-esmeralda',   { es: 'Pokémon Esmeralda',    en: 'Pokémon Emerald' }],
        ['pokemon-rubi-omega',  { es: 'Pokémon Rubí Omega',   en: 'Pokémon Omega Ruby' }],
        ['pokemon-zafiro-alfa', { es: 'Pokémon Zafiro Alfa',  en: 'Pokémon Alpha Sapphire' }],
    ]},
    { region: 'Sinnoh', labels: { es: 'Sinnoh', en: 'Sinnoh' }, games: [
        ['pokemon-diamante',           { es: 'Pokémon Diamante',           en: 'Pokémon Diamond' }],
        ['pokemon-perla',              { es: 'Pokémon Perla',              en: 'Pokémon Pearl' }],
        ['pokemon-platino',            { es: 'Pokémon Platino',            en: 'Pokémon Platinum' }],
        ['pokemon-diamante-brillante', { es: 'Pokémon Diamante Brillante', en: 'Pokémon Brilliant Diamond' }],
        ['pokemon-perla-reluciente',   { es: 'Pokémon Perla Reluciente',   en: 'Pokémon Shining Pearl' }],
    ]},
    { region: 'Unova1', labels: { es: 'Teselia', en: 'Unova' }, games: [
        ['pokemon-negro',  { es: 'Pokémon Edición Negra',  en: 'Pokémon Black' }],
        ['pokemon-blanco', { es: 'Pokémon Edición Blanca', en: 'Pokémon White' }],
    ]},
    { region: 'Unova2', labels: { es: 'Teselia 2', en: 'Unova 2' }, games: [
        ['pokemon-negro-2',  { es: 'Pokémon Edición Negra 2',  en: 'Pokémon Black 2' }],
        ['pokemon-blanco-2', { es: 'Pokémon Edición Blanca 2', en: 'Pokémon White 2' }],
    ]},
    { region: 'Kalos', labels: { es: 'Kalos', en: 'Kalos' }, games: [
        ['pokemon-x', { es: 'Pokémon X', en: 'Pokémon X' }],
        ['pokemon-y', { es: 'Pokémon Y', en: 'Pokémon Y' }],
    ]},
    { region: 'Galar', labels: { es: 'Galar', en: 'Galar' }, games: [
        ['pokemon-espada', { es: 'Pokémon Espada', en: 'Pokémon Sword' }],
        ['pokemon-escudo', { es: 'Pokémon Escudo', en: 'Pokémon Shield' }],
    ]},
    { region: 'Paldea', labels: { es: 'Paldea', en: 'Paldea' }, games: [
        ['pokemon-escarlata', { es: 'Pokémon Escarlata', en: 'Pokémon Scarlet' }],
        ['pokemon-purpura',   { es: 'Pokémon Púrpura',   en: 'Pokémon Violet' }],
    ]},
];

// ── i18n ─────────────────────────────────────────────────────────
// currentLang is a global defined in lang.js (loaded before badges.js)
const BADGE_STRINGS = {
    es: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Medallas',
        typesMode:              'Tabla de tipos',
        cemeteryMode:           'Cementerio',
        badgeGame:              'Juego',
        badgeLayout:            'Diseño',
        badgeBrightness:        'Brillo inactivas',
        badgeObsHint:           dims => `Añade un <strong>Browser Source</strong> en OBS.<br>Tamaño recomendado: <strong>${dims}</strong>`,
        badgeUrlLabel:          'URL para la fuente de navegador',
        badgeUrlCopy:           'Copiar',
        badgeUrlCopied:         '¡URL copiada!',
        badgePublishBtn:        '📡 Publicar medallas en OBS',
        badgeResetBtn:          'Resetear medallas',
        badgePublishOk:         '¡Overlay de medallas actualizado!',
        badgePublishErr:        'Error al publicar. ¿Está configurado Ably?',
        badgeNewChannel:        '🔄 Nuevo enlace',
        badgeNewChannelConfirm: '¿Generar un nuevo enlace? Tendrás que actualizar la URL en OBS.',
        badgeConfirmReset:      '¿Resetear todas las medallas?',
        badgeSuccessReset:      'Medallas reseteadas.',
        badgeCopyPrompt:        'Copia este enlace:',
    },
    en: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Badges',
        typesMode:              'Types table',
        cemeteryMode:           'Cemetery',
        badgeGame:              'Game',
        badgeLayout:            'Layout',
        badgeBrightness:        'Inactive brightness',
        badgeObsHint:           dims => `Add a <strong>Browser Source</strong> in OBS.<br>Recommended size: <strong>${dims}</strong>`,
        badgeUrlLabel:          'Browser source URL',
        badgeUrlCopy:           'Copy',
        badgeUrlCopied:         'URL copied!',
        badgePublishBtn:        '📡 Publish badges to OBS',
        badgeResetBtn:          'Reset badges',
        badgePublishOk:         'Badge overlay updated in OBS!',
        badgePublishErr:        'Publish error. Is Ably configured?',
        badgeNewChannel:        '🔄 New link',
        badgeNewChannelConfirm: 'Generate a new link? You will need to update the URL in OBS.',
        badgeConfirmReset:      'Reset all badge data?',
        badgeSuccessReset:      'Badges reset.',
        badgeCopyPrompt:        'Copy this link:',
    },
};

function tB(key, arg) {
    const val = BADGE_STRINGS[currentLang][key];
    return typeof val === 'function' ? val(arg) : val;
}

function applyBadgeLang() {
    document.querySelectorAll('[data-i18n-badge]').forEach(el => {
        const key = el.dataset.i18nBadge;
        const s = BADGE_STRINGS[currentLang];
        if (typeof s[key] === 'string') el.textContent = s[key];
    });
    buildBadgeGameSelect();
    if (badgeChannelId) updateBadgeObsHint();
}

// ── Helpers ──────────────────────────────────────────────────────
function getLayouts(count) {
    const layouts = [];
    for (let cols = 1; cols <= count; cols++) {
        if (count % cols === 0) {
            layouts.push({ cols, rows: count / cols, value: `${cols}x${count / cols}` });
        }
    }
    return layouts;
}

function defaultLayout(count) {
    const layouts = getLayouts(count);
    return (layouts.find(l => l.rows === 2) || layouts[0]).value;
}

// ── State ─────────────────────────────────────────────────────────
let badgeGame       = 'pokemon-rojo';
let badgeRegion     = 'Kanto';
let badgeLayout     = '4x2';
let badgeActive     = Array(8).fill(false);
let badgeBrightness = 20;
let badgeChannelId  = null;

// ── Selectors ────────────────────────────────────────────────────
function buildBadgeGameSelect() {
    const sel = document.getElementById('badge-game-select');
    if (!sel) return;
    sel.innerHTML = BADGE_GAMES.map(g =>
        `<optgroup label="${g.labels[currentLang]}">${g.games.map(([val, names]) =>
            `<option value="${val}"${val === badgeGame ? ' selected' : ''}>${names[currentLang]}</option>`
        ).join('')}</optgroup>`
    ).join('');
    sel.onchange = () => {
        badgeGame   = sel.value;
        badgeRegion = GAME_TO_REGION[badgeGame];
        const count = REGION_DATA[badgeRegion].count;
        badgeActive = Array(count).fill(false);
        badgeLayout = defaultLayout(count);
        buildBadgeLayoutSelect();
        buildBadgeCheckboxes();
        saveBadgeState();
        updateBadgeObsHint();
        schedulePreviewBadgeUpdate();
    };
}

function buildBadgeLayoutSelect() {
    const count   = REGION_DATA[badgeRegion].count;
    const layouts = getLayouts(count);
    const sel     = document.getElementById('badge-layout-select');
    if (!sel) return;
    sel.innerHTML = layouts.map(l =>
        `<option value="${l.value}"${l.value === badgeLayout ? ' selected' : ''}>${l.cols}×${l.rows} — ${l.cols * 80}×${l.rows * 80} px</option>`
    ).join('');
    sel.onchange = () => {
        badgeLayout = sel.value;
        saveBadgeState();
        updateBadgeObsHint();
        schedulePreviewBadgeUpdate();
    };
}

// ── Badge checkboxes ─────────────────────────────────────────────
function buildBadgeCheckboxes() {
    const count     = REGION_DATA[badgeRegion].count;
    const container = document.getElementById('badge-checkboxes');
    if (!container) return;
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${Math.ceil(count / 2)}, auto)`;
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'badge-check-item';

        const img = document.createElement('img');
        img.src       = `badges/${badgeRegion}/${i + 1}.webp`;
        img.alt       = `Badge ${i + 1}`;
        img.className = 'badge-thumb';

        const cb  = document.createElement('input');
        cb.type    = 'checkbox';
        cb.checked = badgeActive[i];
        cb.addEventListener('change', () => {
            badgeActive[i] = cb.checked;
            saveBadgeState();
            schedulePreviewBadgeUpdate();
        });

        item.appendChild(img);
        item.appendChild(cb);
        container.appendChild(item);
    }
}

function updateBadgeBrightness(val) {
    badgeBrightness = Number(val);
    const brVal = document.getElementById('badge-brightness-val');
    if (brVal) brVal.textContent = val + '%';
    saveBadgeState();
    schedulePreviewBadgeUpdate();
}

// ── Overlay HTML builder ─────────────────────────────────────────
function buildBadgeOverlayHTML() {
    const [cols, rows] = badgeLayout.split('x').map(Number);
    const count        = REGION_DATA[badgeRegion].count;
    const bv           = (badgeBrightness / 100).toFixed(2);

    const imgs = Array.from({ length: count }, (_, i) => {
        const filter = badgeActive[i] ? '' : `filter:brightness(${bv});`;
        const delay  = (i * 0.08).toFixed(2);
        return `<img src="badges/${badgeRegion}/${i + 1}.webp" style="width:80px;height:80px;object-fit:contain;display:block;animation:fadeSlideUp 0.45s ${delay}s ease forwards;opacity:0;${filter}" alt="">`;
    }).join('\n');

    return `<html>
<head>
<meta charset="UTF-8">
<style>
body,html{margin:0;padding:0;background:transparent;}
.grid{display:grid;grid-template-columns:repeat(${cols},80px);gap:0;width:${cols * 80}px;}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
</style>
</head>
<body>
<div class="grid">
${imgs}
</div>
</body>
</html>`;
}

// ── Live preview ──────────────────────────────────────────────────
let badgePreviewTimeout = null;

function schedulePreviewBadgeUpdate() {
    clearTimeout(badgePreviewTimeout);
    badgePreviewTimeout = setTimeout(updateBadgePreview, 300);
}

function updateBadgePreview() {
    const iframe  = document.getElementById('badge-preview-iframe');
    const wrapper = document.getElementById('badge-preview-wrapper');
    if (!iframe || !wrapper) return;
    const [cols, rows] = badgeLayout.split('x').map(Number);
    const nativeW = cols * 80;
    const nativeH = rows * 80;

    const card       = wrapper.parentElement;
    const cardStyle  = getComputedStyle(card);
    const containerW = card.clientWidth
        - parseFloat(cardStyle.paddingLeft)
        - parseFloat(cardStyle.paddingRight);

    const scale = Math.min(1, containerW / nativeW);
    iframe.style.width          = nativeW + 'px';
    iframe.style.height         = nativeH + 'px';
    iframe.style.transform      = `scale(${scale})`;
    wrapper.style.width         = Math.round(nativeW * scale) + 'px';
    wrapper.style.height        = Math.round(nativeH * scale) + 'px';
    wrapper.style.margin        = '0 auto';

    iframe.srcdoc = buildBadgeOverlayHTML();
}

// ── OBS hint ─────────────────────────────────────────────────────
function updateBadgeObsHint() {
    const hint = document.getElementById('badge-obs-hint');
    if (!hint) return;
    const [cols, rows] = badgeLayout.split('x').map(Number);
    const dims = `${cols * 80}×${rows * 80}`;
    const url  = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    hint.innerHTML =
        tB('badgeObsHint', dims) +
        `<br><br><span class="obs-url-label">${tB('badgeUrlLabel')}</span>` +
        `<div class="obs-url-row">` +
        `<span class="obs-url-display">${url}</span>` +
        `<button class="btn-copy-url" onclick="copyBadgeOverlayUrl()">${tB('badgeUrlCopy')}</button>` +
        `</div>` +
        `<div class="obs-channel-actions">` +
        `<button class="btn-channel-action" onclick="newBadgeChannel()">${tB('badgeNewChannel')}</button>` +
        `</div>`;
}

function copyBadgeOverlayUrl() {
    const url = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setBadgeStatus(tB('badgeUrlCopied'), 'var(--success)'));
    } else {
        prompt(tB('badgeCopyPrompt'), url);
    }
}

function newBadgeChannel() {
    if (!confirm(tB('badgeNewChannelConfirm'))) return;
    badgeChannelId = crypto.randomUUID();
    localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
    updateBadgeObsHint();
}

// ── Publish ───────────────────────────────────────────────────────
async function publishBadgesToObs() {
    try {
        const resp = await fetch('/api/publish', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:         badgeChannelId,
                region:     badgeRegion,
                layout:     badgeLayout,
                active:     badgeActive,
                brightness: badgeBrightness,
            }),
        });
        setBadgeStatus(tB(resp.ok ? 'badgePublishOk' : 'badgePublishErr'), resp.ok ? 'var(--success)' : 'var(--error)');
    } catch {
        setBadgeStatus(tB('badgePublishErr'), 'var(--error)');
    }
}

// ── Reset ─────────────────────────────────────────────────────────
function resetBadges() {
    if (!confirm(tB('badgeConfirmReset'))) return;
    const count = REGION_DATA[badgeRegion].count;
    badgeActive     = Array(count).fill(false);
    badgeBrightness = 20;
    buildBadgeCheckboxes();
    const br = document.getElementById('badge-brightness');
    const brVal = document.getElementById('badge-brightness-val');
    if (br) br.value = 20;
    if (brVal) brVal.textContent = '20%';
    saveBadgeState();
    schedulePreviewBadgeUpdate();
    setBadgeStatus(tB('badgeSuccessReset'), 'var(--success)');
}

function setBadgeStatus(msg, color) {
    const el = document.getElementById('badge-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = color;
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 4000);
}

// ── Persistence ───────────────────────────────────────────────────
function saveBadgeState() {
    localStorage.setItem('ptv_badge_game',       badgeGame);
    localStorage.setItem('ptv_badge_layout',     badgeLayout);
    localStorage.setItem('ptv_badge_active',     JSON.stringify(badgeActive));
    localStorage.setItem('ptv_badge_brightness', String(badgeBrightness));
}

function loadBadgeState() {
    const game = localStorage.getItem('ptv_badge_game');
    if (game && GAME_TO_REGION[game]) {
        badgeGame   = game;
        badgeRegion = GAME_TO_REGION[game];
    }
    const count  = REGION_DATA[badgeRegion].count;
    const layout = localStorage.getItem('ptv_badge_layout');
    if (layout && getLayouts(count).some(l => l.value === layout)) badgeLayout = layout;
    else badgeLayout = defaultLayout(count);

    const active = localStorage.getItem('ptv_badge_active');
    if (active) {
        try {
            const parsed = JSON.parse(active);
            badgeActive = (Array.isArray(parsed) && parsed.length === count)
                ? parsed.map(Boolean)
                : Array(count).fill(false);
        } catch { badgeActive = Array(count).fill(false); }
    } else {
        badgeActive = Array(count).fill(false);
    }

    const brightness = localStorage.getItem('ptv_badge_brightness');
    if (brightness !== null) badgeBrightness = Math.min(100, Math.max(0, Number(brightness)));
}

// ── Init ──────────────────────────────────────────────────────────
function initBadges() {
    badgeChannelId = localStorage.getItem('ptv_badge_channel_id');
    if (!badgeChannelId) {
        badgeChannelId = crypto.randomUUID();
        localStorage.setItem('ptv_badge_channel_id', badgeChannelId);
    }

    loadBadgeState();
    buildBadgeGameSelect();
    buildBadgeLayoutSelect();
    buildBadgeCheckboxes();
    document.getElementById('badge-brightness').value            = badgeBrightness;
    document.getElementById('badge-brightness-val').textContent  = badgeBrightness + '%';
    updateBadgeObsHint();
    applyBadgeLang();

    if (typeof setMode === 'function') setMode('pokemon');
    updateBadgePreview();
}

initBadges();
