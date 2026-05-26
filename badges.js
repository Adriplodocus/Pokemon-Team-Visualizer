// ── Constants ────────────────────────────────────────────────────
const GAME_TO_REGION = {
    'pokemon-rojo':               'Kanto',
    'pokemon-azul':               'Kanto',
    'pokemon-amarillo':           'Kanto',
    'pokemon-rojo-fuego':         'Kanto',
    'pokemon-verde-hoja':         'Kanto',
    'pokemon-lets-go-pikachu':    'Kanto',
    'pokemon-lets-go-eevee':      'Kanto',
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
    { region: 'Kanto', label: 'Kanto', games: [
        ['pokemon-rojo',            'Pokémon Rojo'],
        ['pokemon-azul',            'Pokémon Azul'],
        ['pokemon-amarillo',        'Pokémon Amarillo'],
        ['pokemon-rojo-fuego',      'Pokémon Rojo Fuego'],
        ['pokemon-verde-hoja',      'Pokémon Verde Hoja'],
        ['pokemon-lets-go-pikachu', "Pokémon: Let's Go, Pikachu!"],
        ['pokemon-lets-go-eevee',   "Pokémon: Let's Go, Eevee!"],
    ]},
    { region: 'Johto', label: 'Johto', games: [
        ['pokemon-oro',        'Pokémon Oro'],
        ['pokemon-plata',      'Pokémon Plata'],
        ['pokemon-cristal',    'Pokémon Cristal'],
        ['pokemon-soulsilver', 'Pokémon SoulSilver'],
        ['pokemon-heartgold',  'Pokémon HeartGold'],
    ]},
    { region: 'Hoenn', label: 'Hoenn', games: [
        ['pokemon-rubi',        'Pokémon Rubí'],
        ['pokemon-zafiro',      'Pokémon Zafiro'],
        ['pokemon-esmeralda',   'Pokémon Esmeralda'],
        ['pokemon-rubi-omega',  'Pokémon Rubí Omega'],
        ['pokemon-zafiro-alfa', 'Pokémon Zafiro Alfa'],
    ]},
    { region: 'Sinnoh', label: 'Sinnoh', games: [
        ['pokemon-diamante',           'Pokémon Diamante'],
        ['pokemon-perla',              'Pokémon Perla'],
        ['pokemon-platino',            'Pokémon Platino'],
        ['pokemon-diamante-brillante', 'Pokémon Diamante Brillante'],
        ['pokemon-perla-reluciente',   'Pokémon Perla Reluciente'],
    ]},
    { region: 'Unova1', label: 'Teselia', games: [
        ['pokemon-negro',  'Pokémon Edición Negra'],
        ['pokemon-blanco', 'Pokémon Edición Blanca'],
    ]},
    { region: 'Unova2', label: 'Teselia 2', games: [
        ['pokemon-negro-2',  'Pokémon Edición Negra 2'],
        ['pokemon-blanco-2', 'Pokémon Edición Blanca 2'],
    ]},
    { region: 'Kalos', label: 'Kalos', games: [
        ['pokemon-x', 'Pokémon X'],
        ['pokemon-y', 'Pokémon Y'],
    ]},
    { region: 'Galar', label: 'Galar', games: [
        ['pokemon-espada', 'Pokémon Espada'],
        ['pokemon-escudo', 'Pokémon Escudo'],
    ]},
    { region: 'Paldea', label: 'Paldea', games: [
        ['pokemon-escarlata', 'Pokémon Escarlata'],
        ['pokemon-purpura',   'Pokémon Púrpura'],
    ]},
];

// ── i18n ─────────────────────────────────────────────────────────
// currentLang is a global defined in app.js (loaded before badges.js)
const BADGE_STRINGS = {
    es: {
        pokemonMode:            'Pokémon',
        badgeMode:              'Medallas',
        badgeGame:              'Juego',
        badgeLayout:            'Diseño',
        badgeBrightness:        'Brillo inactivas',
        badgeObsHint:           dims => `Añade un <strong>Browser Source</strong> en OBS.<br>Tamaño recomendado: <strong>${dims}</strong>`,
        badgeUrlLabel:          'URL para la fuente de navegador',
        badgeUrlSub:            'No tienes que cambiarla salvo si creas una nueva.',
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
        badgeGame:              'Game',
        badgeLayout:            'Layout',
        badgeBrightness:        'Inactive brightness',
        badgeObsHint:           dims => `Add a <strong>Browser Source</strong> in OBS.<br>Recommended size: <strong>${dims}</strong>`,
        badgeUrlLabel:          'Browser source URL',
        badgeUrlSub:            'No need to change it unless you create a new one.',
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

// ── State ─────────────────────────────────────────────────────────
let badgeGame       = 'pokemon-rojo';
let badgeRegion     = 'Kanto';
let badgeLayout     = '8x1';
let badgeActive     = Array(8).fill(true);
let badgeBrightness = 20;
let badgeChannelId  = null;

// ── Selectors ────────────────────────────────────────────────────
function buildBadgeGameSelect() {
    const sel = document.getElementById('badge-game-select');
    sel.innerHTML = BADGE_GAMES.map(g =>
        `<optgroup label="${g.label}">${g.games.map(([val, label]) =>
            `<option value="${val}"${val === badgeGame ? ' selected' : ''}>${label}</option>`
        ).join('')}</optgroup>`
    ).join('');
    sel.onchange = () => {
        badgeGame   = sel.value;
        badgeRegion = GAME_TO_REGION[badgeGame];
        const count = REGION_DATA[badgeRegion].count;
        badgeActive = Array(count).fill(true);
        badgeLayout = getLayouts(count)[0].value;
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
