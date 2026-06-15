const BASE_URL            = 'https://pokemon.mrklypp.com/sprites/';
const CEMETERY_KEY        = 'ptv_cemetery';
const CEMETERY_CONFIG_KEY = 'ptv_cemetery_config';
const DEFAULT_PROPS       = { gender: 'male', skin: 'common', shiny: 'False' };
let cemeteryConfig = { cols: 4, rows: 3, overflow: true };

const CEMETERY_TYPO_KEY = 'ptv_cemetery_typo';

const CEMETERY_FONTS = [
    'Abril Fatface','Alfa Slab One','Anton','Bangers','Bebas Neue',
    'Black Han Sans','Black Ops One','Boogaloo','Carter One','Changa One',
    'Chewy','Cinzel','Concert One','Creepster','Exo 2',
    'Fascinate','Fredoka One','Fugaz One','Graduate','Gugi',
    'Josefin Sans','Knewave','Lilita One','Lobster','Luckiest Guy',
    'Montserrat','Nunito','Orbitron','Oswald','Oxanium',
    'Pacifico','Passion One','Patua One','Permanent Marker','Pirata One',
    'Poller One','Press Start 2P','Racing Sans One','Righteous','Rubik',
    'Russo One','Sigmar One','Skranji','Squada One','Titan One',
    'Viga','Yanone Kaffeesatz',
];

const DEFAULT_CEMETERY_TYPO = {
    font:        'Anton',
    size:        56,
    textColor:   '#ffffff',
    strokeWidth: 0,
    strokeColor: '#000000',
};
let cemeteryTypo = { ...DEFAULT_CEMETERY_TYPO };

const FEMALE_VARIANTS = new Set([
    'abomasnow','aipom','alakazam','ambipom','basculegion','beautifly',
    'bibarel','bidoof','blaziken','buizel','butterfree','cacturne',
    'camerupt','combee','combusken','croagunk','dodrio','doduo',
    'donphan','dustox','finneon','floatzel','frillish','gabite',
    'garchomp','gible','girafarig','gligar','gloom','golbat','goldeen',
    'gulpin','gyarados','heracross','hippopotas','hippowdon','houndoom',
    'hypno','indeedee','jellicent','kadabra','kricketot','kricketune',
    'ledian','ledyba','ludicolo','lumineon','luxio','luxray','magikarp',
    'mamoswine','medicham','meditite','meganium','meowstic','milotic',
    'murkrow','nidoran','numel','nuzleaf','octillery','oinkologne',
    'pachirisu','pikachu','piloswine','politoed','pyroar','quagsire',
    'raichu','raticate','rattata','relicanth','rhydon','rhyhorn',
    'rhyperior','roselia','roserade','scizor','scyther','seaking',
    'shiftry','shinx','sneasel','snover','staraptor','staravia','starly',
    'steelix','sudowoodo','swalot','tangrowth','torchic','toxicroak',
    'unfezant','ursaring','venusaur','vileplume','weavile','wobbuffet',
    'wooper','xatu','zubat',
]);

// ── i18n ──────────────────────────────────────────────────────────
const CEMETERY_STRINGS = {
    es: {
        gridCols:             'Cols',
        gridRows:             'Filas',
        gridOverflow:         'Overflow',
        gridOverflowTip:      'No disponible en grid 1×1',
        gridOverflowDesc:     'Muestra un contador con los Pokémon que no caben en el grid',
        obsHint:              dims => `Añade un <strong>Browser Source</strong> en OBS.<br>Tamaño recomendado: <strong>${dims}</strong>`,
        cemeteryAdd:          'Añadir al cementerio',
        cemeteryEmpty:        'Ningún Pokémon en el cementerio.',
        cemeteryPublish:      '📡 Publicar',
        cemeteryPublishOk:    '¡Cementerio actualizado en OBS!',
        cemeteryPublishErr:   'Error al publicar.',
        cemeteryReset:        'Resetear',
        cemeteryResetConfirm: '¿Vaciar el cementerio?',
        obsUrlLabel:          'URL para la fuente de navegador',
        obsUrlCopy:           'Copiar URL para OBS',
        obsUrlCopied:         '¡URL copiada!',
        newChannel:           '🔄 Nuevo enlace',
        newChannelConfirm:    '¿Generar un nuevo enlace? Tendrás que actualizar la URL en OBS.',
        namePh:               'Nombre...',
        notePh:               'Mote...',
        propsBtn:             'Propiedades',
        modalTitle:           'propiedades',
        modalGender:          'Género',
        modalSkin:            'Skin',
        modalShiny:           'Shiny',
        modalSet:             'Aplicar',
        errNoName:            'Escribe un nombre de Pokémon.',
        errUnknown:           n => `Pokémon desconocido: ${n}`,
        errWriteFirst:        'Escribe primero un nombre de Pokémon.',
        madeBy:               'Hecho por @MrKlypp',
        copyEditorUrl:        '🔗 Copiar link para editor',
        externalBanner:       id => `Controlando canal externo · ${id}`,
        exitExternal:         'Salir',
        sharePromptCopy:      'Copia este enlace:',
        typoFont:             'Fuente',
        typoSize:             'Tamaño',
        typoText:             'Texto',
        typoStroke:           'Borde',
    },
    en: {
        gridCols:             'Cols',
        gridRows:             'Rows',
        gridOverflow:         'Overflow',
        gridOverflowTip:      'Not available on 1×1 grid',
        gridOverflowDesc:     'Shows a counter for Pokémon that don\'t fit in the grid',
        obsHint:              dims => `Add a <strong>Browser Source</strong> in OBS.<br>Recommended size: <strong>${dims}</strong>`,
        cemeteryAdd:          'Add to cemetery',
        cemeteryEmpty:        'No Pokémon in the cemetery.',
        cemeteryPublish:      '📡 Publish',
        cemeteryPublishOk:    'Cemetery updated in OBS!',
        cemeteryPublishErr:   'Error publishing.',
        cemeteryReset:        'Reset',
        cemeteryResetConfirm: 'Clear the cemetery?',
        obsUrlLabel:          'Browser source URL',
        obsUrlCopy:           'Copy OBS URL',
        obsUrlCopied:         'URL copied!',
        newChannel:           '🔄 New link',
        newChannelConfirm:    'Generate a new link? You will need to update the URL in OBS.',
        namePh:               'Name...',
        notePh:               'Nickname...',
        propsBtn:             'Properties',
        modalTitle:           'properties',
        modalGender:          'Gender',
        modalSkin:            'Skin',
        modalShiny:           'Shiny',
        modalSet:             'Set',
        errNoName:            'Write a Pokémon name.',
        errUnknown:           n => `Unknown Pokémon: ${n}`,
        errWriteFirst:        'Write a Pokémon name first.',
        madeBy:               'Made by @MrKlypp',
        copyEditorUrl:        '🔗 Copy editor link',
        externalBanner:       id => `Controlling external channel · ${id}`,
        exitExternal:         'Exit',
        sharePromptCopy:      'Copy this link:',
        typoFont:             'Font',
        typoSize:             'Size',
        typoText:             'Text',
        typoStroke:           'Stroke',
    },
};

function tC(key, arg) {
    const val = (CEMETERY_STRINGS[currentLang] || CEMETERY_STRINGS.es)[key];
    return typeof val === 'function' ? val(arg) : (val ?? key);
}

// ── State ─────────────────────────────────────────────────────────
let cemetery = [];
let channelId = null;
let externalMode = false;
let pokemonNames = [];
const ALIAS_TO_CANONICAL = {};
let pendingEntry = { name: '', mote: '', props: { ...DEFAULT_PROPS } };
let modalProps   = { ...DEFAULT_PROPS };

// ── Channel ID ────────────────────────────────────────────────────
function initChannelId() {
    const params = new URLSearchParams(location.search);
    const urlId  = params.get('id');
    const bidId  = params.get('bid');

    if (urlId) {
        channelId    = urlId;
        externalMode = true;
        sessionStorage.setItem('ptv_external_id', urlId);
        if (bidId) sessionStorage.setItem('ptv_external_badge_id', bidId);
    } else {
        const storedExtId = sessionStorage.getItem('ptv_external_id');
        if (storedExtId) {
            channelId    = storedExtId;
            externalMode = true;
        } else {
            channelId = localStorage.getItem('ptv_channel_id');
            if (!channelId) {
                channelId = crypto.randomUUID();
                localStorage.setItem('ptv_channel_id', channelId);
            }
        }
    }
}

// ── Persist ───────────────────────────────────────────────────────
function saveCemetery() {
    if (externalMode) return;
    localStorage.setItem(CEMETERY_KEY, JSON.stringify(cemetery));
}

function loadCemetery() {
    try {
        cemetery = JSON.parse(localStorage.getItem(CEMETERY_KEY) || '[]');
    } catch(_) { cemetery = []; }
}

function saveCemeteryConfig() {
    if (externalMode) return;
    localStorage.setItem(CEMETERY_CONFIG_KEY, JSON.stringify(cemeteryConfig));
}

function loadCemeteryConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(CEMETERY_CONFIG_KEY) || '{}');
        cemeteryConfig.cols     = Math.min(10, Math.max(1, parseInt(saved.cols) || 4));
        cemeteryConfig.rows     = Math.min(10, Math.max(1, parseInt(saved.rows) || 3));
        cemeteryConfig.overflow = saved.overflow !== false;
    } catch(_) {}
}

function saveCemeteryTypo() {
    if (externalMode) return;
    localStorage.setItem(CEMETERY_TYPO_KEY, JSON.stringify(cemeteryTypo));
}

function loadCemeteryTypo() {
    try {
        const saved = JSON.parse(localStorage.getItem(CEMETERY_TYPO_KEY) || '{}');
        if (saved && Object.keys(saved).length) cemeteryTypo = { ...DEFAULT_CEMETERY_TYPO, ...saved };
    } catch(_) {}
}

async function hydrateFromAbly() {
    try {
        const resp = await fetch(`/api/load?id=${channelId}&event=cemetery-update`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (!Array.isArray(data.raw)) return;

        cemetery = data.raw.map(e => ({
            name:  e.name || '',
            mote:  e.mote || '',
            props: { ...DEFAULT_PROPS, ...(e.props || {}) },
        }));

        if (!externalMode) saveCemetery();
        renderCemetery();
    } catch (_) {}
}

// ── Sprite URL ────────────────────────────────────────────────────
function buildSpriteUrl(name, props) {
    const lower    = name.toLowerCase();
    const shiny    = props.shiny === 'True';
    const skin     = props.skin  || 'common';
    const gender   = props.gender || 'male';
    const catalog  = POKEMON_CATALOG[lower] || {};
    const skins    = catalog.skin || [];
    const hasFemale = FEMALE_VARIANTS.has(lower);

    let fileName = lower;
    let folder   = BASE_URL;
    if (skin !== 'common' && skins.includes(skin)) fileName += '_' + skin;
    if (shiny) folder += 'shiny/';
    if (gender === 'female' && hasFemale && skin === 'common') folder += 'female/';
    return folder + encodeURIComponent(fileName) + '.gif';
}

// ── Autocomplete ──────────────────────────────────────────────────
initInput();

Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
    fetch('pokemon-aliases.json').then(r => r.json()),
])
.then(([names, aliases]) => {
    for (const [canonical, aliasList] of Object.entries(aliases)) {
        for (const alias of aliasList) ALIAS_TO_CANONICAL[alias] = canonical;
    }
    pokemonNames = [...names, ...Object.values(aliases).flat()].sort();
})
.catch(() => {});

function updateSuggestions(input, list) {
    const typed = input.value.toLowerCase();
    if (typed.length < 2) { closeSuggestions(list); return; }
    const starts  = pokemonNames.filter(n => n.startsWith(typed));
    const rest    = pokemonNames.filter(n => !n.startsWith(typed) && n.includes(typed));
    const matches = [...starts, ...rest].slice(0, 8);
    if (!matches.length) { closeSuggestions(list); return; }
    list.innerHTML = matches.map(n => `<li data-value="${n}">${n}</li>`).join('');
    list.style.display = 'block';
}

function closeSuggestions(list) { list.innerHTML = ''; list.style.display = 'none'; }

function initInput() {
    const nameInput   = document.getElementById('cemetery-name-input');
    const suggestions = document.getElementById('cemetery-suggestions');
    if (!nameInput || !suggestions) return;
    let activeSuggIdx = -1;

    nameInput.addEventListener('input', () => {
        activeSuggIdx = -1;
        pendingEntry.name = nameInput.value;
        updateSuggestions(nameInput, suggestions);
        updatePendingSprite();
    });

    nameInput.addEventListener('keydown', e => {
        const items = [...suggestions.querySelectorAll('li')];
        if (e.key === 'Tab' && suggestions.style.display === 'block') {
            e.preventDefault();
            const target = items[activeSuggIdx] ?? items[0];
            if (target) {
                nameInput.value = target.dataset.value;
                pendingEntry.name = target.dataset.value;
                updatePendingSprite();
            }
            closeSuggestions(suggestions); activeSuggIdx = -1;
        } else if (e.key === 'Enter') {
            closeSuggestions(suggestions); activeSuggIdx = -1;
        } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.style.display === 'block') {
            e.preventDefault();
            if (!items.length) return;
            activeSuggIdx = e.key === 'ArrowDown'
                ? Math.min(activeSuggIdx + 1, items.length - 1)
                : (activeSuggIdx < 0 ? items.length - 1 : Math.max(0, activeSuggIdx - 1));
            items.forEach(li => li.classList.remove('active'));
            items[activeSuggIdx].classList.add('active');
            nameInput.value = items[activeSuggIdx].dataset.value;
            pendingEntry.name = nameInput.value;
            updatePendingSprite();
        }
    });

    suggestions.addEventListener('click', e => {
        const li = e.target.closest('li');
        if (!li) return;
        nameInput.value = li.dataset.value;
        pendingEntry.name = li.dataset.value;
        closeSuggestions(suggestions); activeSuggIdx = -1;
        updatePendingSprite();
    });


    document.addEventListener('click', e => {
        if (!e.target.closest('#cemetery-ac-wrapper')) closeSuggestions(suggestions);
    });
}

function updatePendingSprite() {
    const img  = document.getElementById('cemetery-pending-sprite');
    if (!img) return;
    const name = pendingEntry.name.toLowerCase().trim();
    if (name && pokemonNames.includes(name)) {
        img.src = buildSpriteUrl(name, pendingEntry.props);
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
        img.src = '';
    }
}

// ── Properties modal ──────────────────────────────────────────────
function openModal() {
    const name = pendingEntry.name.trim();
    if (!name) { setStatus(tC('errWriteFirst'), 'var(--error)'); return; }
    document.getElementById('modal-title').textContent = capitalize(name) + ' ' + tC('modalTitle');

    const lower   = name.toLowerCase();
    const catalog = POKEMON_CATALOG[lower] || {};
    const skins   = ['common', ...(catalog.skin || [])];
    const props   = pendingEntry.props;
    modalProps    = { ...props };

    document.getElementById('modal-props').innerHTML = `
        <div class="modal-row">
            <label>${tC('modalGender')}</label>
            <select id="mp-gender" onchange="modalProps.gender=this.value">
                <option value="male"   ${props.gender === 'male'   ? 'selected' : ''}>male</option>
                <option value="female" ${props.gender === 'female' ? 'selected' : ''}>female</option>
            </select>
        </div>
        <div class="modal-row">
            <label>${tC('modalSkin')}</label>
            <select id="mp-skin" onchange="modalProps.skin=this.value">
                ${skins.map(s => `<option value="${s}" ${props.skin === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
        </div>
        <div class="modal-row">
            <label>${tC('modalShiny')}</label>
            <select id="mp-shiny" onchange="modalProps.shiny=this.value">
                <option value="False" ${props.shiny === 'False' ? 'selected' : ''}>False</option>
                <option value="True"  ${props.shiny === 'True'  ? 'selected' : ''}>True</option>
            </select>
        </div>`;

    document.getElementById('modal-backdrop').classList.add('open');
}

function applyModal() {
    pendingEntry.props = { ...modalProps };
    closeModal();
    updatePendingSprite();
}

function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
}

const backdropEl = document.getElementById('modal-backdrop');
if (backdropEl) {
    backdropEl.addEventListener('click', e => {
        if (e.target === backdropEl) closeModal();
    });
}

// ── Add / Remove / Reset ──────────────────────────────────────────
function addToCemetery() {
    const name = pendingEntry.name.trim().toLowerCase();
    if (!name) { setStatus(tC('errNoName'), 'var(--error)'); return; }
    if (pokemonNames.length && !pokemonNames.includes(name)) {
        setStatus(tC('errUnknown', name), 'var(--error)'); return;
    }
    cemetery.unshift({ name, mote: pendingEntry.mote.trim(), props: { ...pendingEntry.props } });
    saveCemetery();
    renderCemetery();
    document.getElementById('cemetery-name-input').value = '';
    document.getElementById('cemetery-pending-sprite').style.display = 'none';
    pendingEntry = { name: '', mote: '', props: { ...DEFAULT_PROPS } };
}

function removeFromCemetery(idx) {
    cemetery.splice(idx, 1);
    saveCemetery();
    renderCemetery();
}

function resetCemetery() {
    if (!confirm(tC('cemeteryResetConfirm'))) return;
    cemetery = [];
    saveCemetery();
    renderCemetery();
}

// ── Render list ───────────────────────────────────────────────────
function renderCemetery() {
    const list    = document.getElementById('cemetery-list');
    const emptyEl = document.getElementById('cemetery-empty');
    if (!cemetery.length) {
        list.innerHTML = '';
        emptyEl.style.display = 'block';
        updateCemeteryPreviewContent();
        return;
    }
    emptyEl.style.display = 'none';
    updateCemeteryPreviewContent();
    list.innerHTML = cemetery.map((entry, idx) => {
        const name      = entry.name.toLowerCase();
        const url       = buildSpriteUrl(name, entry.props);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        const label = entry.mote || entry.name;
        const fbAttr = fallback !== url
            ? `onerror="if(this.src!==${JSON.stringify(fallback)}){this.src=${JSON.stringify(fallback)};this.onerror=null;}"`
            : '';
        return `
            <div class="cemetery-entry">
                <img src="${url}" ${fbAttr} alt="${escapeHtml(name)}">
                <span class="cemetery-entry-name">${escapeHtml(label)}</span>
                <button class="cemetery-remove-btn" onclick="removeFromCemetery(${idx})">✕</button>
            </div>`;
    }).join('');
}

// ── OBS URL ────────────────────────────────────────────────────────
function updateObsUrl() {
    const banner = document.getElementById('external-banner');
    if (banner) {
        banner.classList.toggle('hidden', !externalMode);
        if (externalMode) banner.innerHTML =
            `<span>${tC('externalBanner', channelId.slice(0, 8))}</span>` +
            `<button onclick="exitExternalMode()">${tC('exitExternal')}</button>`;
    }
    updateCemeteryObsHint();
}

function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    location.href = location.pathname;
}

function copyObsUrl() {
    const url = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
    navigator.clipboard.writeText(url).then(() => setStatus(tC('obsUrlCopied'), 'var(--success)'));
}

function copyEditorUrl() {
    const bid = typeof badgeChannelId !== 'undefined' && badgeChannelId ? `&bid=${badgeChannelId}` : '';
    const url = `https://pokemon.mrklypp.com/cemetery.html?id=${channelId}${bid}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setStatus(tC('obsUrlCopied'), 'var(--success)'));
    } else {
        prompt(tC('sharePromptCopy'), url);
    }
}

function newChannel() {
    if (!confirm(tC('newChannelConfirm'))) return;
    channelId = crypto.randomUUID();
    localStorage.setItem('ptv_channel_id', channelId);
    updateObsUrl();
}

// ── Publish ────────────────────────────────────────────────────────
async function publishCemetery() {
    const entries = cemetery.map(entry => {
        const name      = entry.name.toLowerCase();
        const url       = buildSpriteUrl(name, entry.props);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        return { url, fallback: fallback !== url ? fallback : null };
    });

    try {
        const resp = await fetch('/api/publish', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id:       channelId,
                event:    'cemetery-update',
                pokemon:  entries,
                cols:     cemeteryConfig.cols,
                rows:     cemeteryConfig.rows,
                overflow: cemeteryConfig.overflow,
                raw:      cemetery.map(e => ({ name: e.name, mote: e.mote, props: { ...e.props } })),
                typography: cemeteryTypo,
            }),
        });
        setStatus(resp.ok ? tC('cemeteryPublishOk') : tC('cemeteryPublishErr'),
                  resp.ok ? 'var(--success)' : 'var(--error)');
    } catch {
        setStatus(tC('cemeteryPublishErr'), 'var(--error)');
    }
}

// ── Status ─────────────────────────────────────────────────────────
function setStatus(msg, color) {
    const el = document.getElementById('cemetery-status');
    if (!el) return;
    el.textContent = msg;
    el.style.color = color || '';
}

// ── Helpers ───────────────────────────────────────────────────────
function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Lang ───────────────────────────────────────────────────────────
function applyCemeteryLang() {
    const ids = {
        'cemetery-add-btn':         tC('cemeteryAdd'),
        'cemetery-publish-btn':     tC('cemeteryPublish'),
        'cemetery-reset-btn':       tC('cemeteryReset'),
        'cemetery-empty':           tC('cemeteryEmpty'),
        'cemetery-props-btn':       tC('propsBtn'),
        'made-by':                  tC('madeBy'),
        'cemetery-cols-label':      tC('gridCols'),
        'cemetery-rows-label':      tC('gridRows'),
        'cemetery-overflow-span':   tC('gridOverflow'),
        'cem-typo-font-label':      tC('typoFont'),
        'cem-typo-size-label':      tC('typoSize'),
        'cem-typo-text-label':      tC('typoText'),
        'cem-typo-stroke-label':    tC('typoStroke'),
    };
    for (const [id, text] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
    const nameInput = document.getElementById('cemetery-name-input');
    if (nameInput) nameInput.placeholder = tC('namePh');
    const modalApply = document.querySelector('.modal-apply');
    if (modalApply) modalApply.textContent = tC('modalSet');
    updateCemeteryObsHint();
    syncOverflowControl();
}

// ── Grid config ────────────────────────────────────────────────────
function updateCemeteryObsHint() {
    const el = document.getElementById('cemetery-obs-hint');
    if (!el) return;
    const w = cemeteryConfig.cols * 110;
    const h = cemeteryConfig.rows * 110;
    const url = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
    el.innerHTML = tC('obsHint', `${w}x${h}`) +
        `<br><br><span class="obs-url-label">${tC('obsUrlLabel')}</span>` +
        `<div class="obs-url-row">` +
        `<button class="btn-copy-url" onclick="copyObsUrl()">${tC('obsUrlCopy')}</button>` +
        (externalMode ? '' : `<button class="btn-new-channel" onclick="newChannel()" aria-label="${tC('newChannel')}"><svg viewBox="0 0 20 20" fill="none"><path d="M16.5 3.5v4h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 7.5A7 7 0 1 0 14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>`) +
        `</div>` +
        `<div class="obs-channel-actions">` +
        (externalMode ? '' : `<button class="btn-channel-action" onclick="copyEditorUrl()">${tC('copyEditorUrl')}</button>`) +
        `</div>`;
}

function syncOverflowControl() {
    const ck  = document.getElementById('cemetery-overflow-check');
    const lbl = document.getElementById('cemetery-overflow-label');
    if (!ck || !lbl) return;
    const is1x1 = cemeteryConfig.cols === 1 && cemeteryConfig.rows === 1;
    if (is1x1) { cemeteryConfig.overflow = false; ck.checked = false; }
    ck.disabled = is1x1;
    if (is1x1) {
        lbl.setAttribute('data-tooltip', tC('gridOverflowTip'));
        lbl.classList.add('overflow-disabled');
    } else {
        lbl.setAttribute('data-tooltip', tC('gridOverflowDesc'));
        lbl.classList.remove('overflow-disabled');
    }
    const typoSection = document.getElementById('cem-typo-section');
    if (typoSection) typoSection.style.display = cemeteryConfig.overflow ? 'flex' : 'none';
}

function initGridControls() {
    const colsSlider = document.getElementById('cemetery-cols-slider');
    const rowsSlider = document.getElementById('cemetery-rows-slider');
    const colsVal    = document.getElementById('cemetery-cols-val');
    const rowsVal    = document.getElementById('cemetery-rows-val');
    const overflowCk = document.getElementById('cemetery-overflow-check');
    if (!colsSlider) return;

    colsSlider.value = cemeteryConfig.cols;
    rowsSlider.value = cemeteryConfig.rows;
    colsVal.textContent = cemeteryConfig.cols;
    rowsVal.textContent = cemeteryConfig.rows;
    overflowCk.checked  = cemeteryConfig.overflow;

    colsSlider.addEventListener('input', () => {
        cemeteryConfig.cols = parseInt(colsSlider.value);
        colsVal.textContent = cemeteryConfig.cols;
        syncOverflowControl();
        saveCemeteryConfig();
        updateCemeteryObsHint();
        updateCemeteryPreview();
        updateCemeteryPreviewContent();
    });

    rowsSlider.addEventListener('input', () => {
        cemeteryConfig.rows = parseInt(rowsSlider.value);
        rowsVal.textContent = cemeteryConfig.rows;
        syncOverflowControl();
        saveCemeteryConfig();
        updateCemeteryObsHint();
        updateCemeteryPreview();
        updateCemeteryPreviewContent();
    });

    overflowCk.addEventListener('change', () => {
        cemeteryConfig.overflow = overflowCk.checked;
        saveCemeteryConfig();
        syncOverflowControl();
        updateCemeteryPreviewContent();
    });

    syncOverflowControl();
}

// ── Preview bg toggle ──────────────────────────────────────────────
function toggleCemeteryPreviewBg() {
    const wrapper = document.getElementById('cemetery-preview-wrapper');
    const btn     = document.getElementById('cemetery-preview-bg-toggle');
    const isLight = wrapper.classList.toggle('bg-light');
    btn.textContent = isLight ? '☾' : '☀';
}

// ── Preview ────────────────────────────────────────────────────────
function updateCemeteryPreview() {
    const wrapper = document.getElementById('cemetery-preview-wrapper');
    const iframe  = document.getElementById('cemetery-preview-iframe');
    if (!wrapper || !iframe) return;

    const card       = wrapper.parentElement;
    const cardStyle  = getComputedStyle(card);
    const containerW = card.clientWidth
        - parseFloat(cardStyle.paddingLeft)
        - parseFloat(cardStyle.paddingRight);
    if (!containerW) return;

    const FIXED_H  = 300;
    const overlayW = cemeteryConfig.cols * 110;
    const overlayH = cemeteryConfig.rows * 110;
    const scale    = Math.min(1, containerW / overlayW, FIXED_H / overlayH);
    const topOffset = (FIXED_H - overlayH * scale) / 2;

    iframe.style.width     = overlayW + 'px';
    iframe.style.height    = overlayH + 'px';
    iframe.style.top       = topOffset + 'px';
    iframe.style.transform = `translateX(-50%) scale(${scale})`;
    wrapper.style.width    = containerW + 'px';
    wrapper.style.height   = FIXED_H + 'px';
    wrapper.style.margin   = '0';
}

function buildCemeteryOverlayHTML() {
    const cols        = cemeteryConfig.cols;
    const rows        = cemeteryConfig.rows;
    const capacity    = cols * rows;
    const hasOverflow = cemeteryConfig.overflow && (cemetery.length > capacity);
    const maxVisible  = hasOverflow ? capacity - 1 : capacity;
    const visible     = cemetery.slice(0, maxVisible);

    const entries = visible.map(entry => {
        const name      = entry.name.toLowerCase();
        const url       = buildSpriteUrl(name, entry.props);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        const fbAttr = fallback !== url
            ? `onerror="if(this.src!==${JSON.stringify(fallback)}){this.src=${JSON.stringify(fallback)};this.onerror=null;}"`
            : '';
        return `<div class="pk-entry"><img src="${url}" ${fbAttr} alt=""></div>`;
    }).join('');

    const overflowCell = hasOverflow
        ? `<div class="pk-overflow">+${cemetery.length - (capacity - 1)}</div>`
        : '';

    const gfFamily = cemeteryTypo.font.replace(/ /g, '+');
    const strokePx = cemeteryTypo.strokeWidth > 0 ? `${cemeteryTypo.strokeWidth}px` : '0';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=${gfFamily}:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body,html{background:transparent;}
body{padding:5px;}
#root{display:grid;gap:10px;grid-template-columns:repeat(${cols},100px);grid-template-rows:repeat(${rows},100px);}
.pk-entry{width:100px;height:100px;display:flex;align-items:center;justify-content:center;}
.pk-entry img{width:100px;height:100px;object-fit:contain;pointer-events:none;user-select:none;display:block;animation:fu .35s ease forwards;opacity:0;}
.pk-overflow{width:100px;height:100px;display:flex;align-items:center;justify-content:center;color:${cemeteryTypo.textColor};font-family:'${cemeteryTypo.font}',Anton,'Arial Narrow Bold',sans-serif;font-size:${cemeteryTypo.size}px;-webkit-text-stroke:${strokePx} ${cemeteryTypo.strokeColor};paint-order:stroke fill;animation:fu .35s ease forwards;opacity:0;}
@keyframes fu{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
</style></head><body><div id="root">${entries}${overflowCell}</div></body></html>`;
}

function updateCemeteryPreviewContent() {
    const iframe = document.getElementById('cemetery-preview-iframe');
    if (!iframe) return;
    iframe.srcdoc = buildCemeteryOverlayHTML();
}

function initCemeteryPreview() {
    updateCemeteryPreview();
    updateCemeteryPreviewContent();
    window.addEventListener('resize', updateCemeteryPreview);
}

// ── Cemetery typography ────────────────────────────────────────────
function buildCemFontDropdown() {
    const panel = document.getElementById('cem-font-panel');
    if (!panel) return;
    CEMETERY_FONTS.forEach(font => {
        const item = document.createElement('div');
        item.className = 'font-dropdown__item' + (font === cemeteryTypo.font ? ' selected' : '');
        item.textContent = font;
        item.style.fontFamily = `'${font}', sans-serif`;
        item.dataset.font = font;
        item.onclick = () => selectCemFont(font);
        panel.appendChild(item);
    });
}

function toggleCemFontDropdown() {
    const panel   = document.getElementById('cem-font-panel');
    const trigger = document.getElementById('cem-font-trigger');
    const isOpen  = panel.classList.toggle('open');
    trigger.classList.toggle('open', isOpen);
    if (isOpen) {
        setTimeout(() => document.addEventListener('click', closeCemFontDropdownOutside, { once: true }), 0);
    }
}

function closeCemFontDropdownOutside(e) {
    const dd = document.getElementById('cem-font-dropdown');
    if (!dd || !dd.contains(e.target)) closeCemFontDropdown();
}

function closeCemFontDropdown() {
    const panel   = document.getElementById('cem-font-panel');
    const trigger = document.getElementById('cem-font-trigger');
    if (panel)   panel.classList.remove('open');
    if (trigger) trigger.classList.remove('open');
}

function selectCemFont(font) {
    cemeteryTypo.font = font;
    const label = document.getElementById('cem-font-selected-label');
    if (label) { label.textContent = font; label.style.fontFamily = `'${font}', sans-serif`; }
    document.querySelectorAll('#cem-font-panel .font-dropdown__item').forEach(el => {
        el.classList.toggle('selected', el.dataset.font === font);
    });
    closeCemFontDropdown();
    saveCemeteryTypo();
    updateCemeteryPreviewContent();
}

function onCemTypoSize(val) {
    cemeteryTypo.size = Number(val);
    const el = document.getElementById('cem-typo-size-val');
    if (el) el.textContent = val + 'px';
    saveCemeteryTypo();
    updateCemeteryPreviewContent();
}

function onCemTypoStroke(val) {
    cemeteryTypo.strokeWidth = Number(val);
    const el = document.getElementById('cem-typo-stroke-val');
    if (el) el.textContent = val + 'px';
    saveCemeteryTypo();
    updateCemeteryPreviewContent();
}

function syncCemTypoUI() {
    const sizeInput    = document.getElementById('cem-typo-size');
    const sizeVal      = document.getElementById('cem-typo-size-val');
    const strokeInput  = document.getElementById('cem-typo-stroke');
    const strokeVal    = document.getElementById('cem-typo-stroke-val');
    const label        = document.getElementById('cem-font-selected-label');
    const textSwatch   = document.getElementById('cem-text-swatch');
    const strokeSwatch = document.getElementById('cem-stroke-swatch');
    if (sizeInput)    sizeInput.value        = cemeteryTypo.size;
    if (sizeVal)      sizeVal.textContent    = cemeteryTypo.size + 'px';
    if (strokeInput)  strokeInput.value      = cemeteryTypo.strokeWidth;
    if (strokeVal)    strokeVal.textContent  = cemeteryTypo.strokeWidth + 'px';
    if (label) { label.textContent = cemeteryTypo.font; label.style.fontFamily = `'${cemeteryTypo.font}', sans-serif`; }
    if (textSwatch)   textSwatch.style.background   = cemeteryTypo.textColor;
    if (strokeSwatch) strokeSwatch.style.background = cemeteryTypo.strokeColor;
    document.querySelectorAll('#cem-font-panel .font-dropdown__item').forEach(el => {
        el.classList.toggle('selected', el.dataset.font === cemeteryTypo.font);
    });
}

// Cemetery color picker
let cemCpTarget = null;
let cemCpH = 0, cemCpS = 1, cemCpB = 1;

function drawCemCpCanvas() {
    const canvas = document.getElementById('cem-cp-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = `hsl(${cemCpH},100%,50%)`;
    ctx.fillRect(0, 0, W, H);
    const wg = ctx.createLinearGradient(0, 0, W, 0);
    wg.addColorStop(0, 'rgba(255,255,255,1)');
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
}

function drawCemHueBar() {
    const canvas = document.getElementById('cem-cp-hue');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const g = ctx.createLinearGradient(0, 0, W, 0);
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${i * 60},100%,50%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function cemHsbToRgb(h, s, b) {
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = b * (1 - s), q = b * (1 - f * s), t = b * (1 - (1 - f) * s);
    const maps = [[b,t,p],[q,b,p],[p,b,t],[p,q,b],[t,p,b],[b,p,q]];
    return maps[i].map(v => Math.round(v * 255));
}

function cemHsbToHex(h, s, b) {
    return '#' + cemHsbToRgb(h, s, b).map(v => v.toString(16).padStart(2, '0')).join('');
}

function cemHexToHsb(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
    let h = 0;
    if (d) {
        if      (max === r) h = ((g - b) / d + 6) % 6 * 60;
        else if (max === g) h = ((b - r) / d + 2) * 60;
        else                h = ((r - g) / d + 4) * 60;
    }
    return { h, s: max ? d / max : 0, b: max };
}

function updateCemCpThumb() {
    const canvas = document.getElementById('cem-cp-canvas');
    const thumb  = document.getElementById('cem-cp-thumb');
    const picker = document.getElementById('cem-color-picker');
    if (!canvas || !thumb || !picker) return;
    const pr = picker.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    thumb.style.left = (cr.left - pr.left + cemCpS * cr.width) + 'px';
    thumb.style.top  = (cr.top  - pr.top  + (1 - cemCpB) * cr.height) + 'px';
}

function updateCemHueThumb() {
    const canvas = document.getElementById('cem-cp-hue');
    const thumb  = document.getElementById('cem-cp-hue-thumb');
    const picker = document.getElementById('cem-color-picker');
    if (!canvas || !thumb || !picker) return;
    const pr = picker.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    thumb.style.left = (cr.left - pr.left + (cemCpH / 360) * cr.width) + 'px';
    thumb.style.top  = (cr.top  - pr.top) + 'px';
}

function applyCemPickerColor() {
    const hex      = cemHsbToHex(cemCpH, cemCpS, cemCpB);
    const hexInput = document.getElementById('cem-cp-hex');
    if (hexInput) hexInput.value = hex.toUpperCase();
    if (cemCpTarget === 'text') {
        cemeteryTypo.textColor = hex;
        const s = document.getElementById('cem-text-swatch');
        if (s) s.style.background = hex;
    } else {
        cemeteryTypo.strokeColor = hex;
        const s = document.getElementById('cem-stroke-swatch');
        if (s) s.style.background = hex;
    }
    saveCemeteryTypo();
    updateCemeteryPreviewContent();
}

function openCemPicker(target) {
    cemCpTarget = target;
    const hex = target === 'text' ? cemeteryTypo.textColor : cemeteryTypo.strokeColor;
    const hsb = cemHexToHsb(hex);
    cemCpH = hsb.h; cemCpS = hsb.s; cemCpB = hsb.b;
    const picker = document.getElementById('cem-color-picker');
    if (!picker) return;
    picker.classList.remove('hidden');
    drawCemCpCanvas();
    drawCemHueBar();
    const hexInput = document.getElementById('cem-cp-hex');
    if (hexInput) hexInput.value = hex.toUpperCase();
    requestAnimationFrame(() => { updateCemCpThumb(); updateCemHueThumb(); });
    setTimeout(() => document.addEventListener('click', closeCemPickerOutside, { once: true }), 0);
}

function closeCemPickerOutside(e) {
    const picker = document.getElementById('cem-color-picker');
    if (!picker) return;
    const swatches = document.querySelectorAll('#cem-typo-section .color-swatch');
    const clickedSwatch = [...swatches].some(s => s.contains(e.target));
    if (!picker.contains(e.target) && !clickedSwatch) {
        picker.classList.add('hidden');
    } else {
        setTimeout(() => document.addEventListener('click', closeCemPickerOutside, { once: true }), 0);
    }
}

function initCemColorPicker() {
    const canvas    = document.getElementById('cem-cp-canvas');
    const hueCanvas = document.getElementById('cem-cp-hue');
    const hexInput  = document.getElementById('cem-cp-hex');
    if (!canvas) return;

    function onCanvasPointer(e) {
        const rect = canvas.getBoundingClientRect();
        cemCpS = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        cemCpB = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
        updateCemCpThumb();
        applyCemPickerColor();
    }

    function onHuePointer(e) {
        const rect = hueCanvas.getBoundingClientRect();
        cemCpH = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
        updateCemHueThumb();
        drawCemCpCanvas();
        applyCemPickerColor();
    }

    let draggingCanvas = false, draggingHue = false;
    canvas.addEventListener('mousedown',    e => { draggingCanvas = true; onCanvasPointer(e); });
    hueCanvas.addEventListener('mousedown', e => { draggingHue = true;   onHuePointer(e); });
    document.addEventListener('mousemove',  e => {
        if (draggingCanvas) onCanvasPointer(e);
        if (draggingHue)    onHuePointer(e);
    });
    document.addEventListener('mouseup', () => { draggingCanvas = false; draggingHue = false; });

    hexInput.addEventListener('change', () => {
        const val = hexInput.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            const hsb = cemHexToHsb(val);
            cemCpH = hsb.h; cemCpS = hsb.s; cemCpB = hsb.b;
            drawCemCpCanvas();
            updateCemCpThumb();
            updateCemHueThumb();
            applyCemPickerColor();
        }
    });
}

// ── Init ───────────────────────────────────────────────────────────
initChannelId();
loadCemeteryConfig();
loadCemeteryTypo();
loadCemetery();
renderCemetery();
updateObsUrl();
updateCemeteryObsHint();
initGridControls();
buildCemFontDropdown();
syncCemTypoUI();
initCemColorPicker();
initCemeteryPreview();
hydrateFromAbly();
