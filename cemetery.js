const BASE_URL      = 'https://pokemonteamvisualizer.pages.dev/sprites/';
const CEMETERY_KEY  = 'ptv_cemetery';
const DEFAULT_PROPS = { gender: 'male', skin: 'common', shiny: 'False' };

// ── i18n ──────────────────────────────────────────────────────────
const CEMETERY_STRINGS = {
    es: {
        cemeteryAdd:          'Añadir al cementerio',
        cemeteryEmpty:        'Ningún Pokémon en el cementerio.',
        cemeteryPublish:      '📡 Publicar cementerio en OBS',
        cemeteryPublishOk:    '¡Cementerio actualizado en OBS!',
        cemeteryPublishErr:   'Error al publicar.',
        cemeteryReset:        'Vaciar cementerio',
        cemeteryResetConfirm: '¿Vaciar el cementerio?',
        obsUrlLabel:          'URL para la fuente de navegador',
        obsUrlSub:            'No tienes que cambiarla salvo si creas una nueva.',
        obsUrlCopy:           'Copiar',
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
    },
    en: {
        cemeteryAdd:          'Add to cemetery',
        cemeteryEmpty:        'No Pokémon in the cemetery.',
        cemeteryPublish:      '📡 Publish cemetery to OBS',
        cemeteryPublishOk:    'Cemetery updated in OBS!',
        cemeteryPublishErr:   'Error publishing.',
        cemeteryReset:        'Clear cemetery',
        cemeteryResetConfirm: 'Clear the cemetery?',
        obsUrlLabel:          'Browser source URL',
        obsUrlSub:            'No need to change it unless you create a new one.',
        obsUrlCopy:           'Copy',
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
    },
};

function tC(key, arg) {
    const val = (CEMETERY_STRINGS[currentLang] || CEMETERY_STRINGS.es)[key];
    return typeof val === 'function' ? val(arg) : (val ?? key);
}

// ── State ─────────────────────────────────────────────────────────
let cemetery = [];
let channelId = null;
let pokemonNames = [];
const ALIAS_TO_CANONICAL = {};
let pendingEntry = { name: '', mote: '', props: { ...DEFAULT_PROPS } };
let modalProps   = { ...DEFAULT_PROPS };

// ── Channel ID ────────────────────────────────────────────────────
function initChannelId() {
    channelId = localStorage.getItem('ptv_channel_id');
    if (!channelId) {
        channelId = crypto.randomUUID();
        localStorage.setItem('ptv_channel_id', channelId);
    }
}

// ── Persist ───────────────────────────────────────────────────────
function saveCemetery() {
    localStorage.setItem(CEMETERY_KEY, JSON.stringify(cemetery));
}

function loadCemetery() {
    try {
        cemetery = JSON.parse(localStorage.getItem(CEMETERY_KEY) || '[]');
    } catch(_) { cemetery = []; }
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
Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
    fetch('pokemon-aliases.json').then(r => r.json()),
])
.then(([names, aliases]) => {
    for (const [canonical, aliasList] of Object.entries(aliases)) {
        for (const alias of aliasList) ALIAS_TO_CANONICAL[alias] = canonical;
    }
    pokemonNames = [...names, ...Object.values(aliases).flat()].sort();
    initInput();
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
    const moteInput   = document.getElementById('cemetery-mote-input');
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

    moteInput.addEventListener('input', () => { pendingEntry.mote = moteInput.value; });

    document.addEventListener('click', e => {
        if (!e.target.closest('#cemetery-ac-wrapper')) closeSuggestions(suggestions);
    });
}

function updatePendingSprite() {
    const img  = document.getElementById('cemetery-pending-sprite');
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

document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-backdrop')) closeModal();
});

// ── Add / Remove / Reset ──────────────────────────────────────────
function addToCemetery() {
    const name = pendingEntry.name.trim().toLowerCase();
    if (!name) { setStatus(tC('errNoName'), 'var(--error)'); return; }
    if (pokemonNames.length && !pokemonNames.includes(name)) {
        setStatus(tC('errUnknown', name), 'var(--error)'); return;
    }
    cemetery.push({ name, mote: pendingEntry.mote.trim(), props: { ...pendingEntry.props } });
    saveCemetery();
    renderCemetery();
    document.getElementById('cemetery-name-input').value = '';
    document.getElementById('cemetery-mote-input').value = '';
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
        return;
    }
    emptyEl.style.display = 'none';
    list.innerHTML = cemetery.map((entry, idx) => {
        const name      = entry.name.toLowerCase();
        const url       = buildSpriteUrl(name, entry.props);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif'
            : BASE_URL + encodeURIComponent(name) + '.gif';
        const label = entry.mote || entry.name;
        const fbAttr = fallback !== url
            ? `onerror="if(this.src!=='${fallback}'){this.src='${fallback}';this.onerror=null;}"`
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
    const el = document.getElementById('cemetery-obs-url-display');
    if (el) el.value = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
}

function copyObsUrl() {
    const url = `https://pokemon.mrklypp.com/cemetery-overlay.html?id=${channelId}`;
    navigator.clipboard.writeText(url).then(() => setStatus(tC('obsUrlCopied'), 'var(--success)'));
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
            body:    JSON.stringify({ id: channelId, event: 'cemetery-update', pokemon: entries }),
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
        'cemetery-url-label':       tC('obsUrlLabel'),
        'cemetery-url-sub':         tC('obsUrlSub'),
        'cemetery-copy-btn':        tC('obsUrlCopy'),
        'cemetery-new-channel-btn': tC('newChannel'),
        'cemetery-empty':           tC('cemeteryEmpty'),
        'cemetery-props-btn':       tC('propsBtn'),
        'made-by':                  tC('madeBy'),
    };
    for (const [id, text] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
    const nameInput = document.getElementById('cemetery-name-input');
    if (nameInput) nameInput.placeholder = tC('namePh');
    const moteInput = document.getElementById('cemetery-mote-input');
    if (moteInput) moteInput.placeholder = tC('notePh');
    const modalApply = document.querySelector('.modal-apply');
    if (modalApply) modalApply.textContent = tC('modalSet');
}

// ── Init ───────────────────────────────────────────────────────────
initChannelId();
loadCemetery();
renderCemetery();
updateObsUrl();
