// ── Constants ────────────────────────────────────────────────────
const GAME_TO_REGION = {
    'pokemon-sol':                'Alola',
    'pokemon-luna':               'Alola',
    'pokemon-ultrasol':           'AlolaUltra',
    'pokemon-ultraluna':          'AlolaUltra',
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
    'pokemon-consonancia':        'Passio',
};

const REGION_DATA = {
    Alola:      { count: 11, ids: [1,2,3,4,5,6,7,8,9,10,12], layouts: ['4x3', '6x2', '11x1', '1x11'] },
    AlolaUltra: { count: 12, dir: 'Alola' },
    Kanto:  { count: 8 },
    Johto:  { count: 8 },
    Hoenn:  { count: 8 },
    Sinnoh: { count: 8 },
    Unova1: { count: 8 },
    Unova2: { count: 8 },
    Kalos:  { count: 8 },
    Galar:  { count: 10 },
    Paldea: { count: 8 },
    Passio: { count: 8 },
};

const BADGE_GAMES = [
    { region: 'Alola', labels: { es: 'Alola', en: 'Alola' }, games: [
        ['pokemon-luna',      { es: 'Pokémon Luna',      en: 'Pokémon Moon' }],
        ['pokemon-sol',       { es: 'Pokémon Sol',       en: 'Pokémon Sun' }],
        ['pokemon-ultraluna', { es: 'Pokémon Ultraluna', en: 'Pokémon Ultra Moon' }],
        ['pokemon-ultrasol',  { es: 'Pokémon Ultrasol',  en: 'Pokémon Ultra Sun' }],
    ]},
    { region: 'Galar', labels: { es: 'Galar', en: 'Galar' }, games: [
        ['pokemon-escudo', { es: 'Pokémon Escudo', en: 'Pokémon Shield' }],
        ['pokemon-espada', { es: 'Pokémon Espada', en: 'Pokémon Sword' }],
    ]},
    { region: 'Hoenn', labels: { es: 'Hoenn', en: 'Hoenn' }, games: [
        ['pokemon-esmeralda',   { es: 'Pokémon Esmeralda',   en: 'Pokémon Emerald' }],
        ['pokemon-rubi',        { es: 'Pokémon Rubí',        en: 'Pokémon Ruby' }],
        ['pokemon-rubi-omega',  { es: 'Pokémon Rubí Omega',  en: 'Pokémon Omega Ruby' }],
        ['pokemon-zafiro',      { es: 'Pokémon Zafiro',      en: 'Pokémon Sapphire' }],
        ['pokemon-zafiro-alfa', { es: 'Pokémon Zafiro Alfa', en: 'Pokémon Alpha Sapphire' }],
    ]},
    { region: 'Johto', labels: { es: 'Johto', en: 'Johto' }, games: [
        ['pokemon-cristal',    { es: 'Pokémon Cristal',    en: 'Pokémon Crystal' }],
        ['pokemon-heartgold',  { es: 'Pokémon HeartGold',  en: 'Pokémon HeartGold' }],
        ['pokemon-oro',        { es: 'Pokémon Oro',        en: 'Pokémon Gold' }],
        ['pokemon-plata',      { es: 'Pokémon Plata',      en: 'Pokémon Silver' }],
        ['pokemon-soulsilver', { es: 'Pokémon SoulSilver', en: 'Pokémon SoulSilver' }],
    ]},
    { region: 'Kalos', labels: { es: 'Kalos', en: 'Kalos' }, games: [
        ['pokemon-x', { es: 'Pokémon X', en: 'Pokémon X' }],
        ['pokemon-y', { es: 'Pokémon Y', en: 'Pokémon Y' }],
    ]},
    { region: 'Kanto', labels: { es: 'Kanto', en: 'Kanto' }, games: [
        ['pokemon-amarillo',        { es: 'Pokémon Amarillo',          en: 'Pokémon Yellow' }],
        ['pokemon-anil',            { es: 'Pokémon Añil',              en: 'Pokémon Añil' }],
        ['pokemon-azul',            { es: 'Pokémon Azul',              en: 'Pokémon Blue' }],
        ['pokemon-lets-go-eevee',   { es: "Pokémon: Let's Go, Eevee!", en: "Pokémon: Let's Go, Eevee!" }],
        ['pokemon-lets-go-pikachu', { es: "Pokémon: Let's Go, Pikachu!", en: "Pokémon: Let's Go, Pikachu!" }],
        ['pokemon-rojo',            { es: 'Pokémon Rojo',              en: 'Pokémon Red' }],
        ['pokemon-rojo-fuego',      { es: 'Pokémon Rojo Fuego',        en: 'Pokémon FireRed' }],
        ['pokemon-verde-hoja',      { es: 'Pokémon Verde Hoja',        en: 'Pokémon LeafGreen' }],
    ]},
    { region: 'Paldea', labels: { es: 'Paldea', en: 'Paldea' }, games: [
        ['pokemon-escarlata', { es: 'Pokémon Escarlata', en: 'Pokémon Scarlet' }],
        ['pokemon-purpura',   { es: 'Pokémon Púrpura',   en: 'Pokémon Violet' }],
    ]},
    { region: 'Passio', labels: { es: 'Passio', en: 'Passio' }, games: [
        ['pokemon-consonancia', { es: 'Pokémon Consonancia', en: 'Pokémon Consonancia' }],
    ]},
    { region: 'Sinnoh', labels: { es: 'Sinnoh', en: 'Sinnoh' }, games: [
        ['pokemon-diamante',           { es: 'Pokémon Diamante',           en: 'Pokémon Diamond' }],
        ['pokemon-diamante-brillante', { es: 'Pokémon Diamante Brillante', en: 'Pokémon Brilliant Diamond' }],
        ['pokemon-perla',              { es: 'Pokémon Perla',              en: 'Pokémon Pearl' }],
        ['pokemon-perla-reluciente',   { es: 'Pokémon Perla Reluciente',   en: 'Pokémon Shining Pearl' }],
        ['pokemon-platino',            { es: 'Pokémon Platino',            en: 'Pokémon Platinum' }],
    ]},
    { region: 'Unova1', labels: { es: 'Teselia', en: 'Unova' }, games: [
        ['pokemon-blanco', { es: 'Pokémon Edición Blanca', en: 'Pokémon White' }],
        ['pokemon-negro',  { es: 'Pokémon Edición Negra',  en: 'Pokémon Black' }],
    ]},
    { region: 'Unova2', labels: { es: 'Teselia 2', en: 'Unova 2' }, games: [
        ['pokemon-blanco-2', { es: 'Pokémon Edición Blanca 2', en: 'Pokémon White 2' }],
        ['pokemon-negro-2',  { es: 'Pokémon Edición Negra 2',  en: 'Pokémon Black 2' }],
    ]},
];

// ── i18n ─────────────────────────────────────────────────────────
// currentLang is a global defined in lang.js (loaded before badges.js)
const BADGE_STRINGS = {
    es: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Medallas',
        typesMode:              'Pokédex',
        cemeteryMode:           'Cementerio',
        badgeGame:              'Juego',
        badgeLayout:            'Diseño',
        badgeBrightness:        'Brillo inactivas',
        badgeObsHint:           dims => `Añade un <strong>Browser Source</strong> en OBS.<br>Tamaño recomendado: <strong>${dims}</strong>`,
        badgeUrlLabel:          'URL para la fuente de navegador',
        badgeUrlCopy:           'Copiar URL para OBS',
        badgeUrlCopied:         '¡URL copiada!',
        badgePublishBtn:        '📡 Publicar',
        badgeResetBtn:          'Resetear',
        badgePublishOk:         '¡Overlay de medallas actualizado!',
        badgePublishErr:        'Error al publicar. ¿Está configurado Ably?',
        badgeNewChannel:        '🔄 Nuevo enlace',
        badgeNewChannelConfirm: '¿Generar un nuevo enlace? Tendrás que actualizar la URL en OBS.',
        badgeConfirmReset:      '¿Resetear todas las medallas?',
        badgeSuccessReset:      'Medallas reseteadas.',
        badgeCopyPrompt:        'Copia este enlace:',
        badgeCopyEditorUrl:  '🔗 Copiar link para editor',
        badgeExternalBanner: id => `Controlando canal externo · ${id}`,
        badgeExitExternal:   'Salir',
    },
    en: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Badges',
        typesMode:              'Pokédex',
        cemeteryMode:           'Cemetery',
        badgeGame:              'Game',
        badgeLayout:            'Layout',
        badgeBrightness:        'Inactive brightness',
        badgeObsHint:           dims => `Add a <strong>Browser Source</strong> in OBS.<br>Recommended size: <strong>${dims}</strong>`,
        badgeUrlLabel:          'Browser source URL',
        badgeUrlCopy:           'Copy OBS URL',
        badgeUrlCopied:         'URL copied!',
        badgePublishBtn:        '📡 Publish',
        badgeResetBtn:          'Reset',
        badgePublishOk:         'Badge overlay updated in OBS!',
        badgePublishErr:        'Publish error. Is Ably configured?',
        badgeNewChannel:        '🔄 New link',
        badgeNewChannelConfirm: 'Generate a new link? You will need to update the URL in OBS.',
        badgeConfirmReset:      'Reset all badge data?',
        badgeSuccessReset:      'Badges reset.',
        badgeCopyPrompt:        'Copy this link:',
        badgeCopyEditorUrl:  '🔗 Copy editor link',
        badgeExternalBanner: id => `Controlling external channel · ${id}`,
        badgeExitExternal:   'Exit',
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
function getBadgeIds(region) {
    const d = REGION_DATA[region];
    return d.ids || Array.from({ length: d.count }, (_, i) => i + 1);
}

function getBadgeDir(region) {
    return REGION_DATA[region].dir || region;
}

function getLayouts(count) {
    const layouts = [];
    for (let cols = 1; cols <= count; cols++) {
        if (count % cols === 0) {
            layouts.push({ cols, rows: count / cols, value: `${cols}x${count / cols}` });
        }
    }
    return layouts;
}

function getRegionLayouts(region) {
    const d = REGION_DATA[region];
    if (d.layouts) return d.layouts.map(v => {
        const [cols, rows] = v.split('x').map(Number);
        return { cols, rows, value: v };
    });
    return getLayouts(d.count);
}

function defaultLayout(region) {
    const layouts = getRegionLayouts(region);
    return (layouts.find(l => l.rows === 2) || layouts[0]).value;
}

// ── State ─────────────────────────────────────────────────────────
let badgeGame       = 'pokemon-rojo';
let badgeRegion     = 'Kanto';
let badgeLayout     = '4x2';
let badgeActive     = Array(8).fill(false);
let badgeBrightness = 20;
let badgeChannelId  = null;
let badgeExternalMode = false;
let badgeProgressMap = {};

let _badgeServerInitDone = false;

function buildBadgesBlob() {
    return {
        badges: {
            game:       badgeGame,
            layout:     badgeLayout,
            active:     badgeActive.slice(),
            brightness: badgeBrightness,
        },
    };
}

function applyBadgesServerState(b) {
    if (b.game && GAME_TO_REGION[b.game]) {
        badgeGame   = b.game;
        badgeRegion = GAME_TO_REGION[b.game];
    }
    const count = REGION_DATA[badgeRegion].count;
    if (b.layout) {
        const layouts = getRegionLayouts(badgeRegion);
        if (layouts.some(l => l.value === b.layout)) badgeLayout = b.layout;
        else badgeLayout = defaultLayout(badgeRegion);
    } else {
        badgeLayout = defaultLayout(badgeRegion);
    }
    if (Array.isArray(b.active) && b.active.length === count) {
        badgeActive = b.active.map(Boolean);
    } else {
        badgeActive = Array(count).fill(false);
    }
    if (b.brightness !== undefined) {
        badgeBrightness = Math.min(100, Math.max(0, Number(b.brightness)));
    }
}

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
        const prevGame  = badgeGame;
        badgeGame       = sel.value;
        badgeRegion     = GAME_TO_REGION[badgeGame];
        const count     = REGION_DATA[badgeRegion].count;

        badgeProgressMap[prevGame] = { active: badgeActive.slice(), layout: badgeLayout };

        const saved = badgeProgressMap[badgeGame];
        if (saved) {
            badgeActive = Array.isArray(saved.active) && saved.active.length === count
                ? saved.active.map(Boolean)
                : Array(count).fill(false);
            badgeLayout = getRegionLayouts(badgeRegion).some(l => l.value === saved.layout)
                ? saved.layout
                : defaultLayout(badgeRegion);
        } else {
            badgeActive = Array(count).fill(false);
            badgeLayout = defaultLayout(badgeRegion);
        }

        buildBadgeLayoutSelect();
        buildBadgeCheckboxes();
        saveBadgeState();
        updateBadgeObsHint();
        schedulePreviewBadgeUpdate();
    };
}

function buildBadgeLayoutSelect() {
    const layouts = getRegionLayouts(badgeRegion);
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
    const ids       = getBadgeIds(badgeRegion);
    const dir       = getBadgeDir(badgeRegion);
    const container = document.getElementById('badge-checkboxes');
    if (!container) return;
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${Math.ceil(count / 2)}, auto)`;
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'badge-check-item';

        const img = document.createElement('img');
        img.src       = `badges/${dir}/${ids[i]}.webp`;
        img.alt       = `Badge ${ids[i]}`;
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
    const ids          = getBadgeIds(badgeRegion);
    const dir          = getBadgeDir(badgeRegion);
    const bv           = (badgeBrightness / 100).toFixed(2);

    const imgs = Array.from({ length: count }, (_, i) => {
        const filter = badgeActive[i] ? '' : `filter:brightness(${bv});`;
        const delay  = (i * 0.08).toFixed(2);
        return `<img src="badges/${dir}/${ids[i]}.webp" style="width:80px;height:80px;object-fit:contain;display:block;animation:fadeSlideUp 0.45s ${delay}s ease forwards;opacity:0;${filter}" alt="">`;
    }).join('\n');

    return `<html>
<head>
<meta charset="UTF-8">
<style>
body,html{margin:0;padding:0;background:transparent;}
.grid{display:flex;flex-wrap:wrap;justify-content:center;width:${cols * 80}px;}
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

function toggleBadgePreviewBg() {
    const wrapper = document.getElementById('badge-preview-wrapper');
    const btn     = document.getElementById('badge-preview-bg-toggle');
    const isLight = wrapper.classList.toggle('bg-light');
    btn.textContent = isLight ? '☾' : '☀';
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

    if (typeof externalMode === 'undefined') {
        const banner = document.getElementById('external-banner');
        if (banner) {
            banner.classList.toggle('hidden', !badgeExternalMode);
            if (badgeExternalMode) banner.innerHTML =
                `<span>${tB('badgeExternalBanner', badgeChannelId.slice(0, 8))}</span>` +
                `<button onclick="exitBadgeExternalMode()">${tB('badgeExitExternal')}</button>`;
        }
    }

    const [cols, rows] = badgeLayout.split('x').map(Number);
    const dims = `${cols * 80}×${rows * 80}`;
    const url  = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    hint.innerHTML =
        tB('badgeObsHint', dims) +
        `<br><br><span class="obs-url-label">${tB('badgeUrlLabel')}</span>` +
        `<div class="obs-url-row">` +
        `<button class="btn-copy-url" onclick="copyBadgeOverlayUrl()">${tB('badgeUrlCopy')}</button>` +
        (badgeExternalMode ? '' : `<button class="btn-new-channel" onclick="newBadgeChannel()" aria-label="${tB('badgeNewChannel')}"><svg viewBox="0 0 20 20" fill="none"><path d="M16.5 3.5v4h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 7.5A7 7 0 1 0 14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>`) +
        `</div>` +
        `<div class="obs-channel-actions">` +
        (badgeExternalMode ? '' : `<button class="btn-channel-action" onclick="copyBadgeEditorUrl()">${tB('badgeCopyEditorUrl')}</button>`) +
        `</div>`;
}

function exitBadgeExternalMode() {
    sessionStorage.removeItem('ptv_external_badge_id');
    location.href = location.pathname;
}

function copyBadgeOverlayUrl() {
    const url = `https://pokemon.mrklypp.com/badge-overlay.html?id=${badgeChannelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setBadgeStatus(tB('badgeUrlCopied'), 'var(--success)'));
    } else {
        prompt(tB('badgeCopyPrompt'), url);
    }
}

function copyBadgeEditorUrl() {
    const mainId = sessionStorage.getItem('ptv_external_id');
    const url = mainId
        ? `https://pokemon.mrklypp.com/index.html?id=${mainId}&bid=${badgeChannelId}`
        : `https://pokemon.mrklypp.com/badges.html?id=${badgeChannelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setBadgeStatus(tB('badgeUrlCopied'), 'var(--success)'));
    } else {
        prompt(tB('badgeCopyPrompt'), url);
    }
}

function newBadgeChannel() {
    if (!confirm(tB('badgeNewChannelConfirm'))) return;
    badgeChannelId = crypto.randomUUID();
    fetch('/api/auth/badge-channel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ badgeChannelId }),
    }).catch(() => {});
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
                game:       badgeGame,
                layout:     badgeLayout,
                active:     badgeActive,
                brightness: badgeBrightness,
                ids:        getBadgeIds(badgeRegion),
                dir:        getBadgeDir(badgeRegion),
            }),
        });
        if (resp.ok) {
            setBadgeStatus(tB('badgePublishOk'), 'var(--success)');
            fetch('/api/state', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(buildBadgesBlob()),
            }).catch(() => {});
            badgeProgressMap[badgeGame] = { active: badgeActive.slice(), layout: badgeLayout };
            fetch('/api/badges/progress', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ game: badgeGame, active: badgeActive, layout: badgeLayout }),
            }).catch(() => {});
        } else {
            setBadgeStatus(tB('badgePublishErr'), 'var(--error)');
        }
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
}

function loadBadgeState() {
    const game = localStorage.getItem('ptv_badge_game');
    if (game && GAME_TO_REGION[game]) {
        badgeGame   = game;
        badgeRegion = GAME_TO_REGION[game];
    }
    const count  = REGION_DATA[badgeRegion].count;
    const layout = localStorage.getItem('ptv_badge_layout');
    if (layout && getRegionLayouts(badgeRegion).some(l => l.value === layout)) badgeLayout = layout;
    else badgeLayout = defaultLayout(badgeRegion);

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

async function hydrateFromAbly() {
    try {
        const resp = await fetch(`/api/load?id=${badgeChannelId}`);
        if (!resp.ok) return;
        const data = await resp.json();

        if (data.game && GAME_TO_REGION[data.game]) {
            badgeGame   = data.game;
            badgeRegion = GAME_TO_REGION[data.game];
        } else if (data.region && REGION_DATA[data.region]) {
            badgeRegion = data.region;
        }

        const count = REGION_DATA[badgeRegion].count;

        if (data.layout) {
            const layouts = getRegionLayouts(badgeRegion);
            if (layouts.some(l => l.value === data.layout)) badgeLayout = data.layout;
        }
        if (Array.isArray(data.active) && data.active.length === count) {
            badgeActive = data.active.map(Boolean);
        }
        if (data.brightness !== undefined) {
            badgeBrightness = Math.min(100, Math.max(0, Number(data.brightness)));
        }

        if (!badgeExternalMode) saveBadgeState();

        buildBadgeGameSelect();
        buildBadgeLayoutSelect();
        buildBadgeCheckboxes();
        document.getElementById('badge-brightness').value           = badgeBrightness;
        document.getElementById('badge-brightness-val').textContent = badgeBrightness + '%';
        updateBadgeObsHint();
        updateBadgePreview();
    } catch (_) {}
}

// ── Init ──────────────────────────────────────────────────────────
async function initBadgeChannelFromServer() {
    const meResult = await fetchAuthMe();
    if (!meResult.ok) return; // badges.js is embedded in app — don't redirect here
    const me = meResult.data;

    if (me.badgeChannelId) {
        badgeChannelId = me.badgeChannelId;
    } else {
        badgeChannelId = localStorage.getItem('ptv_badge_channel_id') || crypto.randomUUID();
        await fetch('/api/auth/badge-channel', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ badgeChannelId }),
        }).catch(() => {});
    }
}

async function initBadges() {
    if (typeof ACTIVE_PAGE !== 'undefined' && ACTIVE_PAGE === 'badges') {
        const urlId = new URLSearchParams(location.search).get('id');
        if (urlId) {
            badgeChannelId    = urlId;
            badgeExternalMode = true;
            sessionStorage.setItem('ptv_external_badge_id', urlId);
        } else {
            const storedExtBadge = sessionStorage.getItem('ptv_external_badge_id');
            if (storedExtBadge) {
                badgeChannelId    = storedExtBadge;
                badgeExternalMode = true;
            } else {
                await initBadgeChannelFromServer();
            }
        }
    } else {
        const storedExtBadge = sessionStorage.getItem('ptv_external_badge_id');
        if (storedExtBadge) {
            badgeChannelId    = storedExtBadge;
            badgeExternalMode = true;
        } else {
            await initBadgeChannelFromServer();
        }
    }

    let hadServerState = false;
    if (!badgeExternalMode) {
        const stateRes = await fetch('/api/state').catch(() => null);
        if (stateRes && stateRes.ok) {
            const serverState = await stateRes.json();
            if (serverState.badges) {
                applyBadgesServerState(serverState.badges);
                hadServerState = true;
            } else {
                loadBadgeState();
                fetch('/api/state', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(buildBadgesBlob()),
                }).catch(() => {});
            }
        } else {
            loadBadgeState();
        }
        _badgeServerInitDone = true;
        fetch('/api/badges/progress')
            .then(r => r.ok ? r.json() : {})
            .then(map => { badgeProgressMap = map; })
            .catch(() => {});
    } else {
        loadBadgeState();
    }

    buildBadgeGameSelect();
    buildBadgeLayoutSelect();
    buildBadgeCheckboxes();
    const bEl = document.getElementById('badge-brightness');
    if (bEl) bEl.value = badgeBrightness;
    const bValEl = document.getElementById('badge-brightness-val');
    if (bValEl) bValEl.textContent = badgeBrightness + '%';
    updateBadgeObsHint();
    applyBadgeLang();

    if (typeof setMode === 'function') setMode('pokemon');
    updateBadgePreview();
    if (!hadServerState && !badgeExternalMode) hydrateFromAbly();
    subscribeToBadgeAblyUpdates();
}

function subscribeToBadgeAblyUpdates() {
    if (typeof Ably === 'undefined') return;
    try {
        const ably = new Ably.Realtime({ authUrl: `/api/token?id=${badgeChannelId}` });
        const ch = ably.channels.get(`ptv-${badgeChannelId}`, { params: { rewind: '1' } });
        ch.subscribe('update', msg => {
            try {
                const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
                if (data.game && GAME_TO_REGION[data.game]) {
                    badgeGame   = data.game;
                    badgeRegion = GAME_TO_REGION[data.game];
                } else if (data.region && REGION_DATA[data.region]) {
                    badgeRegion = data.region;
                }
                const count = REGION_DATA[badgeRegion].count;
                if (data.layout) {
                    const layouts = getRegionLayouts(badgeRegion);
                    if (layouts.some(l => l.value === data.layout)) badgeLayout = data.layout;
                }
                if (Array.isArray(data.active) && data.active.length === count) {
                    badgeActive = data.active.map(Boolean);
                }
                if (data.brightness !== undefined) {
                    badgeBrightness = Math.min(100, Math.max(0, Number(data.brightness)));
                }
                buildBadgeGameSelect();
                buildBadgeLayoutSelect();
                buildBadgeCheckboxes();
                document.getElementById('badge-brightness').value           = badgeBrightness;
                document.getElementById('badge-brightness-val').textContent = badgeBrightness + '%';
                updateBadgeObsHint();
                updateBadgePreview();
            } catch (_) {}
        });
    } catch (_) {}
}

(async () => { await initBadges(); })();
