// ── i18n ────────────────────────────────────────────────────────
const STRINGS = {
    es: {
        subtitle1:     'Genera tu overlay de equipo Pokémon para OBS en segundos.',
        subtitle2:     'Escribe los nombres exactamente como aparecen en el juego.',
        warn:          'Si encuentras algún error, por favor házmelo saber.',
        layout:        'Diseño',
        horizontal:    'Horizontal',
        vertical:      'Vertical',
        showShadows:   'Mostrar sombras',
        showBg:        'Mostrar fondo de pokéball',
        resetBtn:      'Resetear',
        madeBy:        'Hecho por @MrKlypp',
        modalSet:      'Aplicar',
        modalTitle:    'propiedades',
        modalGender:   'Género',
        modalSkin:     'Skin',
        modalShiny:    'Shiny',
        namePh:        'Nombre...',
        notePh:        'Mote...',
        propsBtn:      'Propiedades',
        errNoName:     'Escribe al menos un nombre de Pokémon.',
        errUnknown:    n => `Pokémon desconocido: ${n}`,
        errWriteFirst: 'Escribe primero un nombre de Pokémon.',
        confirmReset:  '¿Seguro que quieres resetear todos los datos?',
        successReset:  'Datos reseteados correctamente.',
        obsHint:          dims => `Añade un <strong>Browser Source</strong> en OBS.<br>Tamaño recomendado: <strong>${dims}</strong>`,
        obsUrlLabel:      'URL para la fuente de navegador',
        obsUrlCopy:       'Copiar URL para OBS',
        obsUrlCopied:     '¡URL copiada!',
        publishBtn:       '📡 Publicar',
        publishOk:        '¡Overlay actualizado en OBS!',
        publishErr:          'Error al publicar. ¿Está configurado Ably?',
        newChannel:          '🔄 Nuevo enlace',
        newChannelConfirm:   '¿Generar un nuevo enlace? Tendrás que actualizar la URL en OBS y el enlace de editor.',
        previewVertical:  'La vista previa solo está disponible en modo horizontal.',
        sharePromptCopy:  'Copia este enlace:',
        presets:          'Presets',
        presetSavePrompt: 'Nombre del preset:',
        presetDefault:    n => `Equipo ${n}`,
        presetEmpty:      '(vacío)',
        presetLoaded:     'Preset cargado.',
        presetSaved:      'Preset guardado.',
        presetDeleted:    'Preset eliminado.',
        tooltipGender:    'Género',
        tooltipMale:      'Macho',
        tooltipFemale:    'Hembra',
        tooltipSkin:      'Skin',
        tooltipShiny:     'Shiny',
        tooltipYes:       'Sí',
        tooltipNo:        'No',
        cookieMsg:        'Esta app usa <strong>localStorage</strong> para guardar tu equipo y ajustes en tu navegador. No hay cookies de seguimiento ni publicidad.',
        cookieOk:         'Entendido',
        copyEditorUrl:   '🔗 Copiar link para editor',
        externalBanner:  id => `Controlando canal externo · ${id}`,
        exitExternal:    'Salir',
        typoFont:        'Fuente',
        typoSize:        'Tamaño',
        typoText:        'Texto',
        typoStroke:      'Borde',
        typoName:        'Nombre',
        typoPosAbove:    '↑ Arriba',
        typoPosBelow:    '↓ Abajo',
        typoPosHidden:   '— Oculto',
        capturedZonesTitle: 'Historial de zonas capturadas',
        searchZonePh:       'Buscar zona...',
        addZonePh:          'Añadir zona...',
        addZoneBtn:         '+ Añadir',
        showZonesBtn:       'Mostrar / buscar zonas',
        noRoutes:           'Sin zonas registradas.',
        zoneAdded:          '✓ Zona añadida.',
        zoneDuplicate:      '✗ Ya existe esa zona.',
        zoneError:          '✗ Error al añadir la zona.',
        clearAllBtn:        'Limpiar todo',
        clearAllConfirm:    '¿Eliminar todas las zonas? Esta acción no se puede deshacer.',
        zonesCleared:       '✓ Todas las zonas eliminadas.',
        zonesClearError:    '✗ Error al eliminar las zonas.',
        lifeCounterTitle:   'Contador de vidas',
        overlayUrlPh:       'https://streamcounters.mrklypp.com/embed/...',
        counterUrlError:    'La URL debe ser de StreamCounters.',
        botTitle:           'Bot de Twitch',
        botDesc:            'El bot de Twitch responde al comando !check {zona}. Responderá si puedes o no capturar en la zona indicada. Añádelo como moderador en tu canal para que pueda escribir en el chat.',
        botDisconnected:    'Desactivado',
        botConnected:       'Activo',
        activateBot:        'Activar bot',
        deactivateBot:      'Desactivar bot',
        counterDesc:        'Necesitas crear un contador en <a href="https://streamcounters.mrklypp.com/" target="_blank" rel="noopener">StreamCounters</a> y pegar el enlace embed iframe aquí.',
    },
    en: {
        subtitle1:     'Generate your Pokémon team overlay for OBS in seconds.',
        subtitle2:     'Write Pokémon names exactly as they appear in-game.',
        warn:          'If you encounter any error, please let me know.',
        layout:        'Layout',
        horizontal:    'Horizontal',
        vertical:      'Vertical',
        showShadows:   'Show shadows',
        showBg:        'Show pokéball background',
        resetBtn:      'Reset',
        madeBy:        'Made by @MrKlypp',
        modalSet:      'Set',
        modalTitle:    'properties',
        modalGender:   'Gender',
        modalSkin:     'Skin',
        modalShiny:    'Shiny',
        namePh:        'Name...',
        notePh:        'Nickname...',
        propsBtn:      'Properties',
        errNoName:     'Write at least one Pokémon name.',
        errUnknown:    n => `Unknown Pokémon: ${n}`,
        errWriteFirst: 'Write a Pokémon name first.',
        confirmReset:  'Are you sure you want to reset all data?',
        successReset:  'Team data was reset successfully.',
        obsHint:          dims => `Add a <strong>Browser Source</strong> in OBS.<br>Recommended size: <strong>${dims}</strong>`,
        obsUrlLabel:      'Browser source URL',
        obsUrlCopy:       'Copy OBS URL',
        obsUrlCopied:     'URL copied!',
        publishBtn:       '📡 Publish',
        publishOk:        'Overlay updated in OBS!',
        publishErr:          'Publish error. Is Ably configured?',
        newChannel:          '🔄 New link',
        newChannelConfirm:   'Generate a new link? You will need to update the URL in OBS.',
        previewVertical:  'Live preview is only available in horizontal mode.',
        sharePromptCopy:  'Copy this link:',
        presets:          'Presets',
        presetSavePrompt: 'Preset name:',
        presetDefault:    n => `Team ${n}`,
        presetEmpty:      '(empty)',
        presetLoaded:     'Preset loaded.',
        presetSaved:      'Preset saved.',
        presetDeleted:    'Preset deleted.',
        tooltipGender:    'Gender',
        tooltipMale:      'Male',
        tooltipFemale:    'Female',
        tooltipSkin:      'Skin',
        tooltipShiny:     'Shiny',
        tooltipYes:       'Yes',
        tooltipNo:        'No',
        cookieMsg:        'This app uses <strong>localStorage</strong> to save your team and settings in your browser. No tracking cookies or ads.',
        cookieOk:         'Got it',
        copyEditorUrl:   '🔗 Copy editor link',
        externalBanner:  id => `Controlling external channel · ${id}`,
        exitExternal:    'Exit',
        typoFont:        'Font',
        typoSize:        'Size',
        typoText:        'Text',
        typoStroke:      'Stroke',
        typoName:        'Name',
        typoPosAbove:    '↑ Above',
        typoPosBelow:    '↓ Below',
        typoPosHidden:   '— Hidden',
        capturedZonesTitle: 'Captured zones history',
        searchZonePh:       'Search zone...',
        addZonePh:          'Add zone...',
        addZoneBtn:         '+ Add',
        showZonesBtn:       'Show / search zones',
        noRoutes:           'No zones recorded.',
        zoneAdded:          '✓ Zone added.',
        zoneDuplicate:      '✗ Zone already exists.',
        zoneError:          '✗ Failed to add zone.',
        clearAllBtn:        'Clear all',
        clearAllConfirm:    'Delete all zones? This action cannot be undone.',
        zonesCleared:       '✓ All zones deleted.',
        zonesClearError:    '✗ Failed to delete zones.',
        lifeCounterTitle:   'Life counter',
        overlayUrlPh:       'https://streamcounters.mrklypp.com/embed/...',
        counterUrlError:    'URL must be from StreamCounters.',
        botTitle:           'Twitch bot',
        botDesc:            'The Twitch bot responds to the command !check {zone}. It will tell you whether you can capture in the specified zone. Add it as a moderator in your channel so it can write in chat.',
        botDisconnected:    'Inactive',
        botConnected:       'Active',
        activateBot:        'Activate bot',
        deactivateBot:      'Deactivate bot',
        counterDesc:        'You need to create a counter on <a href="https://streamcounters.mrklypp.com/" target="_blank" rel="noopener">StreamCounters</a> and paste the iframe embed link here.',
    }
};

function t(key, arg) {
    const val = STRINGS[currentLang][key];
    return typeof val === 'function' ? val(arg) : val;
}

function setLang(lang) {
    setLangBase(lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyLang();
    applyHeaderLang();
    if (typeof applyBadgeLang === 'function') applyBadgeLang();
    rlSetBotUI(rlBotActive);
}

function applyLang() {
    const s = STRINGS[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (typeof s[key] === 'string') el.textContent = s[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        if (typeof s[key] === 'string') el.placeholder = s[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18nHtml;
        const val = t(key);
        if (val !== key) el.innerHTML = val;
    });
    updateObsHint();
    for (let i = 0; i < 6; i++) refreshIcons(i);
    renderPresets();
}

// ── Constants ───────────────────────────────────────────────────
const BASE_URL     = 'https://pokemon.mrklypp.com/sprites/';
const SHADOW_URL   = 'https://i.postimg.cc/xdmpF4Tm/Shadow.png';
const POKEBALL_URL = 'https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png';

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

// ── State ───────────────────────────────────────────────────────
const DEFAULT_PROPS = { gender: 'male', skin: 'common', shiny: 'False' };

const GOOGLE_FONTS = [
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

const DEFAULT_TYPOGRAPHY = {
    font:         'Anton',
    size:         35,
    textColor:    '#ffffff',
    strokeWidth:  3,
    strokeColor:  '#000000',
    namePosition: 'above',
};

let typography = { ...DEFAULT_TYPOGRAPHY };

const team = Array.from({ length: 6 }, () => ({
    name: '',
    mote: '',
    properties: { ...DEFAULT_PROPS }
}));

let pokemonNames = [];
const ALIAS_TO_CANONICAL = {};
let SPRITE_VER = '?v=2';
let channelId    = null;
let externalMode = false;
let currentUser   = null;
let serverPresets = [null, null, null];

let _saveIndicatorTimer = null;
function setSaveIndicator(state, text) {
    const el = document.getElementById('save-indicator');
    if (!el) return;
    el.className = 'save-indicator ' + state;
    el.textContent = text;
    clearTimeout(_saveIndicatorTimer);
    if (state === 'saved') {
        _saveIndicatorTimer = setTimeout(() => {
            el.className = 'save-indicator hidden';
            el.textContent = '';
        }, 2000);
    }
}

function buildStateBlob() {
    return {
        team:       team.map(s => ({ name: s.name, mote: s.mote, properties: { ...s.properties } })),
        layout:     document.getElementById('layout-select').value,
        shadows:    document.getElementById('shadows-check').checked,
        bg:         document.getElementById('bg-check').checked,
        typography: { ...typography },
        presets:    serverPresets.slice(),
        counterUrl: document.getElementById('counter-url')?.value || '',
    };
}

let _saveTimer = null;
function scheduleSaveToServer() {
    setSaveIndicator('saving', 'Guardando…');
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(async () => {
        try {
            const res = await fetch('/api/state', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(buildStateBlob()),
            });
            if (res.ok) {
                setSaveIndicator('saved', 'Guardado ✓');
            } else {
                setSaveIndicator('error', 'Error al guardar');
            }
        } catch {
            setSaveIndicator('error', 'Error al guardar');
        }
    }, 1000);
}

let modalIndex   = -1;
let modalVars    = {};
let dragSrcIndex    = -1;
let dragInsertBefore = true;

// ── Load autocomplete list ──────────────────────────────────────
Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
    fetch('pokemon-aliases.json').then(r => r.json()),
    fetch('/api/version').then(r => r.json()).catch(() => ({ v: '2' })),
])
.then(([names, aliases, ver]) => {
    SPRITE_VER = '?v=' + ver.v;
    for (const [canonical, aliasList] of Object.entries(aliases)) {
        for (const alias of aliasList) {
            ALIAS_TO_CANONICAL[alias] = canonical;
        }
    }
    const allAliases = Object.values(aliases).flat();
    pokemonNames = [...names, ...allAliases].sort();
    for (let i = 0; i < 6; i++) refreshSprite(i);
    updatePreview();
})
.catch(() => {});

// ── Build UI rows ───────────────────────────────────────────────
function buildRows() {
    const container = document.getElementById('team-rows');
    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'pokemon-row';
        row.dataset.index = i;
        row.innerHTML = `
            <span class="drag-handle" title="Drag to reorder">⠿</span>
            <img class="sprite-preview" src="" alt="" decoding="async" onclick="openModal(${i})" style="cursor:pointer">
            <span class="row-label">Pokémon ${i + 1}:</span>
            <div class="ac-wrapper">
                <input class="name-input" type="text" data-i18n-ph="namePh" autocomplete="off" spellcheck="false">
                <ul class="suggestions"></ul>
            </div>
            <input class="mote-input" type="text" data-i18n-ph="notePh">
            <div class="icons">
                <span class="icon gender-icon" title="Gender">♂</span>
                <span class="icon skin-icon dimmed" title="Skin">◆</span>
                <span class="icon shiny-icon dimmed" title="Shiny">★</span>
            </div>
            <button class="props-btn" data-i18n="propsBtn" onclick="openModal(${i})"></button>
            <button class="clear-btn" onclick="clearSlot(${i})">✕</button>
        `;
        container.appendChild(row);

        const nameInput   = row.querySelector('.name-input');
        const moteInput   = row.querySelector('.mote-input');
        const suggestions = row.querySelector('.suggestions');
        let activeSuggIdx = -1;

        nameInput.addEventListener('input', () => {
            activeSuggIdx = -1;
            team[i].name = nameInput.value;
            team[i].properties = { ...DEFAULT_PROPS };
            updateSuggestions(nameInput, suggestions, i);
            refreshIcons(i);
            refreshSprite(i);
            saveState(false);
        });
        nameInput.addEventListener('blur', () => { schedulePreviewUpdate(); });
        nameInput.addEventListener('keydown', e => {
            if (e.key === 'Tab' && suggestions.style.display === 'block') {
                e.preventDefault();
                const items = [...suggestions.querySelectorAll('li')];
                const target = items[activeSuggIdx] ?? items[0];
                if (target) {
                    nameInput.value = target.dataset.value;
                    team[i].name = target.dataset.value;
                    refreshSprite(i);
        
                    saveState();
                }
                closeSuggestions(suggestions);
                activeSuggIdx = -1;
            } else if (e.key === 'Enter') {
                refreshSprite(i);
    
                saveState();
                closeSuggestions(suggestions);
                activeSuggIdx = -1;
            } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.style.display === 'block') {
                e.preventDefault();
                const items = [...suggestions.querySelectorAll('li')];
                if (!items.length) return;
                if (e.key === 'ArrowDown') {
                    activeSuggIdx = activeSuggIdx < items.length - 1 ? activeSuggIdx + 1 : activeSuggIdx;
                } else {
                    activeSuggIdx = activeSuggIdx < 0 ? items.length - 1 : Math.max(0, activeSuggIdx - 1);
                }
                items.forEach(li => li.classList.remove('active'));
                items[activeSuggIdx].classList.add('active');
                nameInput.value = items[activeSuggIdx].dataset.value;
                team[i].name = nameInput.value;
                refreshSprite(i);
    
            }
        });
        moteInput.addEventListener('input', () => { team[i].mote = moteInput.value; saveState(); });

        suggestions.addEventListener('click', e => {
            const li = e.target.closest('li');
            if (!li) return;
            nameInput.value = li.dataset.value;
            team[i].name = li.dataset.value;
            closeSuggestions(suggestions);
            activeSuggIdx = -1;
            refreshSprite(i);

            saveState();
        });

        // ── Drag & drop ─────────────────────────────────────────
        const handle = row.querySelector('.drag-handle');
        handle.draggable = true;

        handle.addEventListener('dragstart', e => {
            dragSrcIndex = i;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(i));
            e.dataTransfer.setDragImage(row, 20, row.offsetHeight / 2);
            setTimeout(() => row.classList.add('dragging'), 0);
        });
        handle.addEventListener('dragend', () => {
            dragSrcIndex = -1;
            row.classList.remove('dragging');
            document.querySelectorAll('.pokemon-row').forEach(r => {
                r.classList.remove('drag-over-top', 'drag-over-bottom');
            });
        });
        row.addEventListener('dragover', e => {
            e.preventDefault();
            if (dragSrcIndex === i) return;
            const rect = row.getBoundingClientRect();
            const insertBefore = e.clientY < rect.top + rect.height / 2;
            dragInsertBefore = insertBefore;
            document.querySelectorAll('.pokemon-row').forEach(r => {
                r.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            row.classList.add(insertBefore ? 'drag-over-top' : 'drag-over-bottom');
        });
        row.addEventListener('dragleave', e => {
            if (!row.contains(e.relatedTarget)) {
                row.classList.remove('drag-over-top', 'drag-over-bottom');
            }
        });
        row.addEventListener('drop', e => {
            e.preventDefault();
            row.classList.remove('drag-over-top', 'drag-over-bottom');
            const src = dragSrcIndex;
            if (src < 0 || src === i) return;
            const [item] = team.splice(src, 1);
            let dest = i;
            if (!dragInsertBefore) dest = i + 1;
            if (src < i) dest -= 1;
            team.splice(dest, 0, item);
            for (let k = 0; k < 6; k++) refreshRow(k);
            saveState();
        });

        row.querySelectorAll('.icon').forEach(icon => {
            icon.addEventListener('click', e => {
                e.stopPropagation();
                showTooltip(icon);
            });
        });
    }

    document.addEventListener('click', e => {
        document.querySelectorAll('.suggestions').forEach(s => {
            if (!s.closest('.ac-wrapper').contains(e.target)) closeSuggestions(s);
        });
    });
}

function updateSuggestions(input, list, idx) {
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

// ── Icons ───────────────────────────────────────────────────────
function refreshIcons(i) {
    const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
    if (!row) return;
    const p   = team[i].properties;

    const gIcon = row.querySelector('.gender-icon');
    gIcon.textContent = p.gender === 'female' ? '♀' : '♂';
    gIcon.className = 'icon gender-icon' + (p.gender === 'female' ? ' female' : '');
    gIcon.dataset.tooltip = t('tooltipGender') + ': ' + (p.gender === 'female' ? t('tooltipFemale') : t('tooltipMale'));

    const sIcon = row.querySelector('.skin-icon');
    sIcon.className = 'icon skin-icon' + (p.skin !== 'common' ? ' active' : ' dimmed');
    sIcon.dataset.tooltip = t('tooltipSkin') + ': ' + (p.skin || 'common');

    const shIcon = row.querySelector('.shiny-icon');
    shIcon.className = 'icon shiny-icon' + (p.shiny === 'True' ? ' active' : ' dimmed');
    shIcon.dataset.tooltip = t('tooltipShiny') + ': ' + (p.shiny === 'True' ? t('tooltipYes') : t('tooltipNo'));
}

// ── Sprite preview ──────────────────────────────────────────────
function refreshSprite(i) {
    const row  = document.querySelector(`.pokemon-row[data-index="${i}"]`);
    const img  = row.querySelector('.sprite-preview');
    const name = team[i].name.trim().toLowerCase();
    if (name && pokemonNames.includes(name)) {
        const url         = buildSpriteUrl(name, team[i].properties);
        const canonical   = ALIAS_TO_CANONICAL[name];
        const fallbackUrl = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif' + SPRITE_VER
            : BASE_URL + encodeURIComponent(name) + '.gif' + SPRITE_VER;
        img.onerror = () => {
            if (img.src !== fallbackUrl) {
                img.src = fallbackUrl;
            } else {
                img.classList.remove('visible');
                img.onerror = null;
            }
        };
        img.src = url;
        img.classList.add('visible');
    } else {
        img.onerror = null;
        img.classList.remove('visible');
        img.src = '';
    }
}

// ── Refresh full row ─────────────────────────────────────────────
function refreshRow(i) {
    const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
    row.querySelector('.name-input').value = team[i].name;
    row.querySelector('.mote-input').value = team[i].mote;
    refreshIcons(i);
    refreshSprite(i);
}

// ── Clear slot ──────────────────────────────────────────────────
function clearSlot(i) {
    team[i] = { name: '', mote: '', properties: { ...DEFAULT_PROPS } };
    const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
    row.querySelector('.name-input').value = '';
    row.querySelector('.mote-input').value = '';
    refreshIcons(i);
    refreshSprite(i);
    saveState();
}

// ── Reset all ───────────────────────────────────────────────────
function resetAll() {
    if (!confirm(t('confirmReset'))) return;
    for (let i = 0; i < 6; i++) clearSlot(i);
    saveState();
    setStatus(t('successReset'), 'var(--success)');
}

// ── Properties modal ────────────────────────────────────────────
function openModal(i) {
    modalIndex = i;
    const name = team[i].name.trim();
    if (!name) {
        setStatus(t('errWriteFirst'), 'var(--error)');
        return;
    }
    document.getElementById('modal-title').textContent = capitalize(name) + ' ' + t('modalTitle');

    const catalog = POKEMON_CATALOG[name.toLowerCase()] || {};
    const skins   = catalog.skipBase ? (catalog.skin || []) : ['common', ...(catalog.skin || [])];
    const props   = team[i].properties;
    modalVars = {};

    const propsEl = document.getElementById('modal-props');
    propsEl.innerHTML = '';

    modalVars.gender = props.gender;
    propsEl.innerHTML += `
        <div class="modal-row">
            <label>${t('modalGender')}</label>
            <select id="mp-gender" onchange="modalVars.gender=this.value">
                <option value="male"   ${props.gender==='male'   ? 'selected':''}>male</option>
                <option value="female" ${props.gender==='female' ? 'selected':''}>female</option>
            </select>
        </div>`;

    const effectiveModalSkin = (catalog.skipBase && (!props.skin || props.skin === 'common'))
        ? (catalog.skin?.[0] ?? 'common') : (props.skin || 'common');
    modalVars.skin = effectiveModalSkin;
    propsEl.innerHTML += `
        <div class="modal-row">
            <label>${t('modalSkin')}</label>
            <select id="mp-skin" onchange="modalVars.skin=this.value">
                ${skins.map(s => `<option value="${s}" ${effectiveModalSkin===s?'selected':''}>${s}</option>`).join('')}
            </select>
        </div>`;

    modalVars.shiny = props.shiny;
    propsEl.innerHTML += `
        <div class="modal-row">
            <label>${t('modalShiny')}</label>
            <select id="mp-shiny" onchange="modalVars.shiny=this.value">
                <option value="False" ${props.shiny==='False'?'selected':''}>False</option>
                <option value="True"  ${props.shiny==='True' ?'selected':''}>True</option>
            </select>
        </div>`;

    document.getElementById('modal-backdrop').classList.add('open');
}

function applyModal() {
    if (modalIndex < 0) return;
    team[modalIndex].properties = { ...modalVars };
    refreshIcons(modalIndex);
    refreshSprite(modalIndex);
    saveState();
    closeModal();
}

function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
    modalIndex = -1;
}

document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-backdrop')) closeModal();
});

// ── Sprite URL builder ──────────────────────────────────────────
function buildSpriteUrl(name, props) {
    const lower   = name.toLowerCase();
    const shiny   = props.shiny === 'True';
    const skin    = props.skin  || 'common';
    const gender  = props.gender || 'male';

    const catalog   = POKEMON_CATALOG[lower] || {};
    const skins     = catalog.skin || [];
    const hasFemale = FEMALE_VARIANTS.has(lower);

    let fileName = lower;
    let folder   = BASE_URL;

    const effectiveSkin = (skin === 'common' && catalog.skipBase && skins.length) ? skins[0] : skin;
    if (effectiveSkin !== 'common' && skins.includes(effectiveSkin)) {
        fileName += '_' + effectiveSkin;
    }
    if (shiny) {
        folder += 'shiny/';
    }
    if (gender === 'female' && hasFemale && skin === 'common') {
        folder += 'female/';
    }

    return folder + encodeURIComponent(fileName) + '.gif' + SPRITE_VER;
}

// ── Generate HTML (used by live preview) ────────────────────────
function buildOverlayHTML(layout, showShadows, showBg, typo) {
    typo = typo || typography;
    const dataBlock = JSON.stringify({ team, layout, shadows: showShadows, bg: showBg, typography: typo });
    const gfFamily = typo.font.replace(/ /g, '+');
    const gfLink   = `<link href="https://fonts.googleapis.com/css2?family=${gfFamily}:wght@400;700&display=swap" rel="stylesheet">`;
    const strokePx = typo.strokeWidth > 0 ? `${typo.strokeWidth}px` : '0';
    const pStyle   = [
        `color:${typo.textColor}`,
        `font-family:'${typo.font}',Anton,'Arial Narrow Bold',sans-serif`,
        `font-size:${typo.size}px`,
        `-webkit-text-stroke:${strokePx} ${typo.strokeColor}`,
        `paint-order:stroke fill`,
    ].join(';');
    const entries = team.map(slot => {
        const name = slot.name.trim().toLowerCase();
        if (!name || !pokemonNames.includes(name)) return null;
        const url      = buildSpriteUrl(name, slot.properties);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif' + SPRITE_VER
            : BASE_URL + encodeURIComponent(name) + '.gif' + SPRITE_VER;
        return {
            mote: (slot.mote || slot.name).toUpperCase(),
            url,
            fallback: fallback !== url ? fallback : null,
        };
    });

    const isHorizontal = layout === 'horizontal';

    const nameHidden = typo.namePosition === 'hidden';
    const nameAbove  = !nameHidden && typo.namePosition !== 'below';

    const pTagsArr = entries.map(e => e ? `<p style="${pStyle}">${e.mote}</p>` : '');
    // pkDiv never contains <p> — names always go in a separate row above or below
    const pkDivContent = entries.map((e, i) => {
        if (!e) return '';
        const bgTag = showBg ? `<img id="pokeballBackground${i+1}" src="${POKEBALL_URL}" decoding="async">` : '';
        const onerr = e.fallback ? ` onerror="if(this.src!=='${e.fallback}'){this.src='${e.fallback}';this.onerror=null;}"` : '';
        const sprTag = `<img id="img${i+1}" src="${e.url}" decoding="async"${onerr}>`;
        return bgTag + sprTag;
    });

    const shadowContent = entries.map((e, i) =>
        e && showShadows ? `<img id="shadow${i+1}" src="${SHADOW_URL}" decoding="async">` : `<img id="shadow${i+1}">`
    );

    if (isHorizontal) {
        return `<html>
<head>
<meta charset="UTF-8">
<script type="application/json" id="ptv-data">${dataBlock}<${'/script>'}
${gfLink}
<style>
body,html{margin:0;padding:0;}
.pkDiv{flex:0 0 225px;width:225px;height:150px;position:relative;}
#pokeballBackground1,#pokeballBackground2,#pokeballBackground3,#pokeballBackground4,#pokeballBackground5,#pokeballBackground6{position:absolute;width:225px;height:150px;z-index:-1;}
.shadowDiv{flex:0 0 225px;width:225px;height:40px;padding-top:5px;}
.sprite-row{position:relative;z-index:1;}
.shadow-row{margin-top:-15px;}
img{width:100%;max-width:100%;max-height:100%;object-fit:contain;pointer-events:none;user-select:none;}
p{margin:0;height:${Math.max(typo.size, 25)}px;line-height:${Math.max(typo.size, 25)}px;text-align:center;}
.container{display:flex;flex-wrap:nowrap;}
.nameDiv{flex:0 0 225px;width:225px;}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.pkDiv,.shadowDiv{animation:fadeSlideUp 0.45s ease forwards;opacity:0;}
.pkDiv:nth-child(1),.shadowDiv:nth-child(1){animation-delay:0.00s;}
.pkDiv:nth-child(2),.shadowDiv:nth-child(2){animation-delay:0.12s;}
.pkDiv:nth-child(3),.shadowDiv:nth-child(3){animation-delay:0.24s;}
.pkDiv:nth-child(4),.shadowDiv:nth-child(4){animation-delay:0.36s;}
.pkDiv:nth-child(5),.shadowDiv:nth-child(5){animation-delay:0.48s;}
.pkDiv:nth-child(6),.shadowDiv:nth-child(6){animation-delay:0.60s;}

</style>
</head>
<body>
${(!nameHidden && nameAbove) ? `<div class="container">\n${entries.map((e, i) => e ? `<div class="nameDiv">${pTagsArr[i]}</div>` : '').join('\n')}\n</div>` : ''}
<div class="container sprite-row">
${entries.map((e, i) => e ? `<div class="pkDiv">${pkDivContent[i]}</div>` : '').join('\n')}
</div>
<div class="container shadow-row">
${entries.map((e, i) => e ? `<div class="shadowDiv">${shadowContent[i]}</div>` : '').join('\n')}
</div>
${(!nameHidden && !nameAbove) ? `<div class="container">\n${entries.map((e, i) => e ? `<div class="nameDiv">${pTagsArr[i]}</div>` : '').join('\n')}\n</div>` : ''}
</body>
</html>`;
    } else {
        return `<html>
<head>
<meta charset="UTF-8">
<script type="application/json" id="ptv-data">${dataBlock}<${'/script>'}
${gfLink}
<style>
body,html{margin:0;padding:0;}
.wrapper{display:flex;flex-direction:column;}
.pair{display:flex;flex-direction:column;margin:0;padding:0;margin-bottom:20px;width:225px;align-items:center;}
.pkDiv,.shadowDiv{margin:0;padding:0;}
.pkDiv{width:225px;position:relative;}
.shadowDiv{width:150px;margin-top:-15px;}
#pokeballBackground1,#pokeballBackground2,#pokeballBackground3,#pokeballBackground4,#pokeballBackground5,#pokeballBackground6{position:absolute;width:225px;height:150px;z-index:-1;}
img{display:block;width:100%;height:auto;max-height:150px;object-fit:contain;pointer-events:none;user-select:none;}
p{margin:0;padding:0;height:25px;text-align:center;}
@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.pair{animation:fadeSlideUp 0.45s ease forwards;opacity:0;}
.pair:nth-child(1){animation-delay:0.00s;}
.pair:nth-child(2){animation-delay:0.12s;}
.pair:nth-child(3){animation-delay:0.24s;}
.pair:nth-child(4){animation-delay:0.36s;}
.pair:nth-child(5){animation-delay:0.48s;}
.pair:nth-child(6){animation-delay:0.60s;}
</style>
</head>
<body>
<div class="wrapper">
${entries.map((e, i) => {
    if (!e) return '';
    const bgTag = showBg ? `<img id="pokeballBackground${i+1}" src="${POKEBALL_URL}" decoding="async">` : '';
    const onerr = e.fallback ? ` onerror="if(this.src!=='${e.fallback}'){this.src='${e.fallback}';this.onerror=null;}"` : '';
    const sprTag = `<img id="img${i+1}" src="${e.url}" decoding="async"${onerr}>`;
    const shTag = shadowContent[i];
    return nameHidden
        ? `<div class="pair">\n  <div class="pkDiv">${bgTag}${sprTag}</div>\n  <div class="shadowDiv">${shTag}</div>\n</div>`
        : nameAbove
            ? `<div class="pair">\n  <div class="pkDiv">${pTagsArr[i]}${bgTag}${sprTag}</div>\n  <div class="shadowDiv">${shTag}</div>\n</div>`
            : `<div class="pair">\n  <div class="pkDiv">${bgTag}${sprTag}</div>\n  <div class="shadowDiv">${shTag}</div>\n  ${pTagsArr[i]}\n</div>`;
}).join('\n')}
</div>
</body>
</html>`;
    }
}

// ── Validation ──────────────────────────────────────────────────
function validateTeam() {
    const invalid = team
        .filter(s => s.name.trim())
        .filter(s => !pokemonNames.includes(s.name.trim().toLowerCase()));
    if (invalid.length) {
        setStatus(t('errUnknown', invalid.map(s => s.name).join(', ')), 'var(--error)');
        return false;
    }
    return true;
}

// ── Live preview ─────────────────────────────────────────────────
function togglePreviewBg() {
    const wrapper = document.getElementById('preview-wrapper');
    const btn     = document.getElementById('preview-bg-toggle');
    const isLight = wrapper.classList.toggle('bg-light');
    btn.textContent = isLight ? '☾' : '☀';
}

// ── Font dropdown ─────────────────────────────────────────────────
function buildFontDropdown() {
    const panel = document.getElementById('font-panel');
    GOOGLE_FONTS.forEach(font => {
        const item = document.createElement('div');
        item.className = 'font-dropdown__item' + (font === typography.font ? ' selected' : '');
        item.textContent = font;
        item.style.fontFamily = `'${font}', sans-serif`;
        item.dataset.font = font;
        item.onclick = () => selectFont(font);
        panel.appendChild(item);
    });
}

function toggleFontDropdown() {
    const panel   = document.getElementById('font-panel');
    const trigger = document.getElementById('font-trigger');
    const isOpen  = panel.classList.toggle('open');
    trigger.classList.toggle('open', isOpen);
    if (isOpen) {
        setTimeout(() => document.addEventListener('click', closeFontDropdownOutside, { once: true }), 0);
    }
}

function closeFontDropdownOutside(e) {
    const dd = document.getElementById('font-dropdown');
    if (!dd.contains(e.target)) closeFontDropdown();
}

function closeFontDropdown() {
    document.getElementById('font-panel').classList.remove('open');
    document.getElementById('font-trigger').classList.remove('open');
}

function selectFont(font) {
    typography.font = font;
    document.getElementById('font-selected-label').textContent = font;
    document.getElementById('font-selected-label').style.fontFamily = `'${font}', sans-serif`;
    document.querySelectorAll('.font-dropdown__item').forEach(el => {
        el.classList.toggle('selected', el.dataset.font === font);
    });
    closeFontDropdown();
    saveTypography();
    schedulePreviewUpdate();
}

function onTypoSize(val) {
    typography.size = Number(val);
    document.getElementById('typo-size-val').textContent = val + 'px';
    saveTypography();
    schedulePreviewUpdate();
}

function onTypoStroke(val) {
    typography.strokeWidth = Number(val);
    document.getElementById('typo-stroke-val').textContent = val + 'px';
    saveTypography();
    schedulePreviewUpdate();
}

function syncTypographyUI() {
    document.getElementById('typo-size').value               = typography.size;
    document.getElementById('typo-size-val').textContent     = typography.size + 'px';
    document.getElementById('typo-stroke').value             = typography.strokeWidth;
    document.getElementById('typo-stroke-val').textContent   = typography.strokeWidth + 'px';
    document.getElementById('font-selected-label').textContent   = typography.font;
    document.getElementById('font-selected-label').style.fontFamily = `'${typography.font}', sans-serif`;
    document.getElementById('text-swatch').style.background   = typography.textColor;
    document.getElementById('stroke-swatch').style.background = typography.strokeColor;
    const pos = typography.namePosition || 'above';
    document.getElementById('pos-above').classList.toggle('active', pos === 'above');
    document.getElementById('pos-below').classList.toggle('active', pos === 'below');
    document.getElementById('pos-hidden').classList.toggle('active', pos === 'hidden');
}

function onNamePosition(pos) {
    typography.namePosition = pos;
    document.getElementById('pos-above').classList.toggle('active', pos === 'above');
    document.getElementById('pos-below').classList.toggle('active', pos === 'below');
    document.getElementById('pos-hidden').classList.toggle('active', pos === 'hidden');
    saveTypography();
    schedulePreviewUpdate();
}

let previewTimeout = null;

function schedulePreviewUpdate() {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(updatePreview, 300);
}

function updatePreview() {
    const layout  = document.getElementById('layout-select').value;
    const msg     = document.getElementById('preview-msg');
    const wrapper = document.getElementById('preview-wrapper');

    msg.textContent   = layout === 'vertical' ? t('previewVertical') : '';
    msg.style.display = layout === 'vertical' ? '' : 'none';
    wrapper.style.display = '';

    const shadows    = document.getElementById('shadows-check').checked;
    const bg         = document.getElementById('bg-check').checked;
    const iframe     = document.getElementById('preview-iframe');
    const cardStyle  = getComputedStyle(wrapper.parentElement);
    const containerW = wrapper.parentElement.clientWidth
        - parseFloat(cardStyle.paddingLeft)
        - parseFloat(cardStyle.paddingRight);

    const nameH     = Math.max(typography.size, 25);
    const overlayH  = 175 + nameH;
    const scale     = Math.max(containerW / 1350, 0.75);
    const wrapperW  = Math.min(Math.round(1350 * scale), containerW);
    const wrapperH  = Math.round(overlayH * scale);
    iframe.style.width     = '1350px';
    iframe.style.height    = overlayH + 'px';
    iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
    wrapper.style.width    = '';
    wrapper.style.height   = '';
    wrapper.style.margin   = '0';

    iframe.srcdoc = buildOverlayHTML('horizontal', shadows, bg, typography);
}

// ── Color picker ──────────────────────────────────────────────────
let cpTarget = null;   // 'text' | 'stroke'
let cpH = 0, cpS = 1, cpB = 1;   // hue 0-360, sat 0-1, bri 0-1

function drawCpCanvas() {
    const canvas = document.getElementById('cp-canvas');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = `hsl(${cpH},100%,50%)`;
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

function drawHueBar() {
    const canvas = document.getElementById('cp-hue');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const g = ctx.createLinearGradient(0, 0, W, 0);
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${i * 60},100%,50%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function hsbToRgb(h, s, b) {
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = b * (1 - s), q = b * (1 - f * s), t = b * (1 - (1 - f) * s);
    const maps = [[b,t,p],[q,b,p],[p,b,t],[p,q,b],[t,p,b],[b,p,q]];
    return maps[i].map(v => Math.round(v * 255));
}

function hsbToHex(h, s, b) {
    return '#' + hsbToRgb(h, s, b).map(v => v.toString(16).padStart(2, '0')).join('');
}

function hexToHsb(hex) {
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

function updateCpThumb() {
    const canvas = document.getElementById('cp-canvas');
    const thumb  = document.getElementById('cp-thumb');
    const picker = document.getElementById('color-picker');
    const pr     = picker.getBoundingClientRect();
    const cr     = canvas.getBoundingClientRect();
    thumb.style.left = (cr.left - pr.left + cpS * cr.width) + 'px';
    thumb.style.top  = (cr.top  - pr.top  + (1 - cpB) * cr.height) + 'px';
}

function updateHueThumb() {
    const canvas = document.getElementById('cp-hue');
    const thumb  = document.getElementById('cp-hue-thumb');
    const picker = document.getElementById('color-picker');
    const pr     = picker.getBoundingClientRect();
    const cr     = canvas.getBoundingClientRect();
    thumb.style.left = (cr.left - pr.left + (cpH / 360) * cr.width) + 'px';
    thumb.style.top  = (cr.top  - pr.top) + 'px';
}

function applyPickerColor() {
    const hex = hsbToHex(cpH, cpS, cpB);
    document.getElementById('cp-hex').value = hex.toUpperCase();
    if (cpTarget === 'text') {
        typography.textColor = hex;
        document.getElementById('text-swatch').style.background = hex;
    } else {
        typography.strokeColor = hex;
        document.getElementById('stroke-swatch').style.background = hex;
    }
    saveTypography();
    schedulePreviewUpdate();
}

function openPicker(target) {
    cpTarget = target;
    const hex = target === 'text' ? typography.textColor : typography.strokeColor;
    const hsb = hexToHsb(hex);
    cpH = hsb.h; cpS = hsb.s; cpB = hsb.b;

    const picker = document.getElementById('color-picker');
    picker.classList.remove('hidden');

    drawCpCanvas();
    drawHueBar();
    document.getElementById('cp-hex').value = hex.toUpperCase();

    requestAnimationFrame(() => { updateCpThumb(); updateHueThumb(); });

    setTimeout(() => document.addEventListener('click', closePickerOutside, { once: true }), 0);
}

function closePickerOutside(e) {
    const picker   = document.getElementById('color-picker');
    const swatches = document.querySelectorAll('.color-swatch');
    const clickedSwatch = [...swatches].some(s => s.contains(e.target));
    if (!picker.contains(e.target) && !clickedSwatch) {
        picker.classList.add('hidden');
    } else {
        setTimeout(() => document.addEventListener('click', closePickerOutside, { once: true }), 0);
    }
}

function initColorPicker() {
    const canvas    = document.getElementById('cp-canvas');
    const hueCanvas = document.getElementById('cp-hue');
    const hexInput  = document.getElementById('cp-hex');

    function onCanvasPointer(e) {
        const rect = canvas.getBoundingClientRect();
        cpS = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        cpB = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
        updateCpThumb();
        applyPickerColor();
    }

    function onHuePointer(e) {
        const rect = hueCanvas.getBoundingClientRect();
        cpH = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
        updateHueThumb();
        drawCpCanvas();
        applyPickerColor();
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
            const hsb = hexToHsb(val);
            cpH = hsb.h; cpS = hsb.s; cpB = hsb.b;
            drawCpCanvas();
            updateCpThumb();
            updateHueThumb();
            applyPickerColor();
        }
    });
}

// ── Persistence ─────────────────────────────────────────────────
function saveState(updatePreview = true) {
    if (externalMode) return;
    if (updatePreview) schedulePreviewUpdate();
    scheduleSaveToServer();
}

function saveTypography() {
    saveState(false);
}

function applyRawState(raw) {
    if (!raw || !Array.isArray(raw.team)) return;

    raw.team.forEach((slot, i) => {
        if (i >= 6) return;
        team[i] = {
            name:       slot.name || '',
            mote:       slot.mote || '',
            properties: { ...DEFAULT_PROPS, ...(slot.properties || {}) },
        };
        const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
        if (!row) return;
        row.querySelector('.name-input').value = team[i].name;
        row.querySelector('.mote-input').value = team[i].mote;
        refreshIcons(i);
        refreshSprite(i);
    });

    if (raw.layout  !== undefined) document.getElementById('layout-select').value  = raw.layout;
    if (raw.shadows !== undefined) document.getElementById('shadows-check').checked = raw.shadows;
    if (raw.bg      !== undefined) document.getElementById('bg-check').checked      = raw.bg;

    if (raw.typography) {
        typography = { ...DEFAULT_TYPOGRAPHY, ...raw.typography };
        syncTypographyUI();
    }

    updatePreview();
    updateObsHint();
}

function applyServerState(state) {
    if (!state) return;
    applyRawState(state);

    serverPresets = Array.isArray(state.presets) ? state.presets.slice(0, 3) : [null, null, null];
    while (serverPresets.length < 3) serverPresets.push(null);
    renderPresets();

    const counterUrl = state.counterUrl || '';
    const counterInput = document.getElementById('counter-url');
    if (counterInput) {
        counterInput.value = counterUrl;
        rlApplyCounterUrl(counterUrl);
    }
}

async function hydrateFromAbly() {
    try {
        const resp = await fetch(`/api/load?id=${channelId}&event=update`);
        if (!resp.ok) return;
        const data = await resp.json();
        applyRawState(data.raw);
    } catch (_) {}
}

function subscribeToAblyUpdates() {
    try {
        const ably = new Ably.Realtime({ authUrl: '/api/token' });
        const channel = ably.channels.get(`ptv-${channelId}`);
        channel.subscribe('update', msg => {
            try {
                const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
                applyRawState(data.raw);
            } catch (_) {}
        });
    } catch (_) {}
}

// ── Helpers ─────────────────────────────────────────────────────
function setStatus(msg, color) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.style.color = color;
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 4000);
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── OBS hint ────────────────────────────────────────────────────
function updateObsHint() {
    const botSection = document.getElementById('bot-section');
    if (botSection) botSection.classList.toggle('hidden', externalMode);

    const banner = document.getElementById('external-banner');
    if (banner) {
        banner.classList.toggle('hidden', !externalMode);
        if (externalMode) banner.innerHTML =
            `<span>${t('externalBanner', channelId.slice(0, 8))}</span>` +
            `<button onclick="exitExternalMode()">${t('exitExternal')}</button>`;
    }

    const layout = document.getElementById('layout-select').value;
    const dims   = layout === 'horizontal' ? '1350x265' : '265x1350';
    const url    = `https://pokemon.mrklypp.com/overlay.html?id=${channelId}`;
    document.getElementById('obs-hint').innerHTML =
        t('obsHint', dims) +
        `<br><br><span class="obs-url-label">${t('obsUrlLabel')}</span>` +
        `<div class="obs-url-row">` +
        `<button class="btn-copy-url" onclick="copyOverlayUrl()">${t('obsUrlCopy')}</button>` +
        (externalMode ? '' : `<button class="btn-new-channel" onclick="newChannel()" aria-label="${t('newChannel')}"><svg viewBox="0 0 20 20" fill="none"><path d="M16.5 3.5v4h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 7.5A7 7 0 1 0 14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>`) +
        `</div>` +
        `<div class="obs-channel-actions">` +
        (externalMode ? '' : `<button class="btn-channel-action" onclick="copyEditorUrl()">${t('copyEditorUrl')}</button>`) +
        `</div>`;
}

function exitExternalMode() {
    sessionStorage.removeItem('ptv_external_id');
    sessionStorage.removeItem('ptv_external_badge_id');
    location.href = location.pathname;
}

function copyOverlayUrl() {
    const url = `https://pokemon.mrklypp.com/overlay.html?id=${channelId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setStatus(t('obsUrlCopied'), 'var(--success)'));
    } else {
        prompt(t('sharePromptCopy'), url);
    }
}

function copyEditorUrl() {
    const bid = typeof badgeChannelId !== 'undefined' && badgeChannelId ? `&bid=${badgeChannelId}` : '';
    const url = `https://pokemon.mrklypp.com/index.html?id=${channelId}${bid}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => setStatus(t('obsUrlCopied'), 'var(--success)'));
    } else {
        prompt(t('sharePromptCopy'), url);
    }
}

// ── Publish to OBS via Ably ──────────────────────────────────────
async function publishToObs() {
    if (!validateTeam()) return;

    const entries = team.map(slot => {
        const name = slot.name.trim().toLowerCase();
        if (!name || !pokemonNames.includes(name)) return null;
        const url      = buildSpriteUrl(name, slot.properties);
        const canonical = ALIAS_TO_CANONICAL[name];
        const fallback  = canonical
            ? BASE_URL + encodeURIComponent(canonical) + '.gif' + SPRITE_VER
            : BASE_URL + encodeURIComponent(name) + '.gif' + SPRITE_VER;
        return {
            mote:     (slot.mote || slot.name).toUpperCase(),
            url,
            fallback: fallback !== url ? fallback : null,
        };
    });

    const layout  = document.getElementById('layout-select').value;
    const shadows = document.getElementById('shadows-check').checked;
    const bg      = document.getElementById('bg-check').checked;

    try {
        const resp = await fetch('/api/publish', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:      channelId,
                team:    entries,
                layout,
                shadows,
                bg,
                typography,
                raw: {
                    team: team.map(s => ({ name: s.name, mote: s.mote, properties: { ...s.properties } })),
                    layout,
                    shadows,
                    bg,
                    typography,
                },
            }),
        });
        setStatus(resp.ok ? t('publishOk') : t('publishErr'), resp.ok ? 'var(--success)' : 'var(--error)');
    } catch {
        setStatus(t('publishErr'), 'var(--error)');
    }
}

function newChannel() {
    if (!confirm(t('newChannelConfirm'))) return;
    channelId = crypto.randomUUID();
    fetch('/api/auth/channel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ channelId }),
    }).catch(() => {});
    updateObsHint();
}

document.getElementById('layout-select').addEventListener('change', () => { saveState(); updateObsHint(); });
document.getElementById('shadows-check').addEventListener('change', saveState);
document.getElementById('bg-check').addEventListener('change', saveState);

// ── Tooltip ──────────────────────────────────────────────────────
const tooltipEl = document.createElement('div');
tooltipEl.className = 'tooltip-popup';
document.body.appendChild(tooltipEl);
let tooltipTimer = null;

function showTooltip(el) {
    clearTimeout(tooltipTimer);
    const text = el.dataset.tooltip || '';
    if (!text) return;
    tooltipEl.textContent = text;
    const rect = el.getBoundingClientRect();
    tooltipEl.style.left = rect.left + rect.width / 2 + 'px';
    tooltipEl.style.top  = rect.top + 'px';
    tooltipEl.style.transform = 'translate(-50%, calc(-100% - 6px))';
    tooltipEl.classList.add('show');
    tooltipTimer = setTimeout(() => tooltipEl.classList.remove('show'), 1500);
}

// ── Presets ───────────────────────────────────────────────────────
function getPreset(slot) {
    return serverPresets[slot] || null;
}

function setPreset(slot, data) {
    serverPresets[slot] = data;
    saveState(false);
}

function savePreset(slot) {
    if (externalMode) return;
    const existing = getPreset(slot);
    const defaultName = existing ? existing.name : t('presetDefault', slot + 1);
    const name = prompt(t('presetSavePrompt'), defaultName);
    if (name === null) return;
    setPreset(slot, {
        name: name.trim() || defaultName,
        team: JSON.parse(JSON.stringify(team)),
        layout: document.getElementById('layout-select').value,
        shadows: document.getElementById('shadows-check').checked,
        bg: document.getElementById('bg-check').checked,
        typography: JSON.parse(JSON.stringify(typography)),
        zones: JSON.parse(JSON.stringify(rlRoutes)),
        counterUrl: document.getElementById('counter-url')?.value || ''
    });
    renderPresets();
    setStatus(t('presetSaved'), 'var(--success)');
}

async function loadPreset(slot) {
    const preset = getPreset(slot);
    if (!preset) return;
    preset.team.forEach((s, i) => {
        if (i >= 6) return;
        team[i] = { name: s.name || '', mote: s.mote || '', properties: { ...DEFAULT_PROPS, ...(s.properties || {}) } };
        const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
        if (!row) return;
        row.querySelector('.name-input').value = team[i].name;
        row.querySelector('.mote-input').value = team[i].mote;
        refreshIcons(i);
        refreshSprite(i);
    });
    if (preset.layout) document.getElementById('layout-select').value = preset.layout;
    if (preset.shadows !== undefined) document.getElementById('shadows-check').checked = preset.shadows;
    if (preset.bg !== undefined) document.getElementById('bg-check').checked = preset.bg;
    if (preset.typography) {
        typography = { ...DEFAULT_TYPOGRAPHY, ...preset.typography };
        saveTypography();
        syncTypographyUI();
    }

    const rlVisible = !document.getElementById('rl-section').classList.contains('hidden');
    if (rlVisible && Array.isArray(preset.zones)) {
        try {
            await fetch(rlRoutesUrl(), { method: 'DELETE' });
            rlRoutes = [];
            for (const z of preset.zones) {
                const res = await fetch(rlRoutesUrl(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ zone: z.zoneName })
                });
                if (res.ok) rlRoutes.push(await res.json());
            }
            rlRenderRoutes();
        } catch (e) {
            console.error('Failed to restore zones from preset', e);
        }
    }

    if (preset.counterUrl !== undefined) {
        const input = document.getElementById('counter-url');
        if (input) input.value = preset.counterUrl;
        rlApplyCounterUrl(preset.counterUrl);
    }

    updateObsHint();
    saveState();
    setStatus(t('presetLoaded'), 'var(--success)');
}

function deletePreset(slot) {
    serverPresets[slot] = null;
    renderPresets();
    saveState(false);
    setStatus(t('presetDeleted'), 'var(--success)');
}

function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderPresets() {
    const bar = document.getElementById('presets-bar');
    if (!bar) return;
    bar.innerHTML = `<span class="preset-label">${t('presets')}:</span>`;
    for (let s = 0; s < 3; s++) {
        const preset = getPreset(s);
        const name = preset ? preset.name : t('presetEmpty');
        const slot = document.createElement('div');
        slot.className = 'preset-slot';
        slot.innerHTML = `
            <button class="preset-load${preset ? '' : ' empty'}" onclick="loadPreset(${s})">${escapeHtml(name)}</button>
            <button class="preset-save" onclick="savePreset(${s})" title="💾">💾</button>
            <button class="preset-del${preset ? ' visible' : ''}" onclick="deletePreset(${s})">✕</button>`;
        bar.appendChild(slot);
    }
}

// ── Cookie notice ────────────────────────────────────────────────
function initCookieNotice() {
    if (localStorage.getItem('ptv_cookie_ok')) return;
    const bar = document.createElement('div');
    bar.id = 'cookie-bar';
    bar.innerHTML = `<span>${t('cookieMsg')}</span><button onclick="dismissCookie()">${t('cookieOk')}</button>`;
    document.body.appendChild(bar);
}

function dismissCookie() {
    localStorage.setItem('ptv_cookie_ok', '1');
    const bar = document.getElementById('cookie-bar');
    if (bar) bar.remove();
}

// ── Init ─────────────────────────────────────────────────────────
function initExternalMode() {
    const params = new URLSearchParams(location.search);
    const urlId  = params.get('id');
    const bidId  = params.get('bid');

    if (urlId) {
        channelId    = urlId;
        externalMode = true;
        sessionStorage.setItem('ptv_external_id', urlId);
        if (bidId) sessionStorage.setItem('ptv_external_badge_id', bidId);
        return;
    }
    const storedExtId = sessionStorage.getItem('ptv_external_id');
    if (storedExtId) {
        channelId    = storedExtId;
        externalMode = true;
    }
}

async function initFromServer() {
    const meRes = await fetch('/api/auth/me');
    if (!meRes.ok) {
        window.location.href = '/login.html';
        return;
    }
    currentUser = await meRes.json();

    if (currentUser.channelId) {
        channelId = currentUser.channelId;
    } else {
        channelId = localStorage.getItem('ptv_channel_id') || crypto.randomUUID();
        await fetch('/api/auth/channel', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ channelId }),
        }).catch(() => {});
    }

    const stateRes = await fetch('/api/state');
    if (!stateRes.ok) return;
    const serverState = await stateRes.json();

    if (serverState.team) {
        applyServerState(serverState);
    } else {
        const localTeam = localStorage.getItem('ptv_team');
        if (localTeam) {
            const migrated = buildMigratedState();
            await fetch('/api/state', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(migrated),
            }).catch(() => {});
            applyServerState(migrated);
        }
    }
}

function buildMigratedState() {
    let parsedTeam = [];
    try { parsedTeam = JSON.parse(localStorage.getItem('ptv_team') || '[]'); } catch (_) {}
    let parsedTypo = null;
    try { parsedTypo = JSON.parse(localStorage.getItem('ptv_typography')); } catch (_) {}
    return {
        team: parsedTeam.slice(0, 6).map(s => ({
            name:       s.name       || '',
            mote:       s.mote       || '',
            properties: { ...DEFAULT_PROPS, ...(s.properties || {}) },
        })),
        layout:     localStorage.getItem('ptv_layout')   || 'horizontal',
        shadows:    localStorage.getItem('ptv_shadows')  !== 'false',
        bg:         localStorage.getItem('ptv_bg')       === 'true',
        typography: parsedTypo ? { ...DEFAULT_TYPOGRAPHY, ...parsedTypo } : { ...DEFAULT_TYPOGRAPHY },
        presets: [0, 1, 2].map(i => {
            try { return JSON.parse(localStorage.getItem('ptv_preset_' + i)); }
            catch (_) { return null; }
        }),
        counterUrl: localStorage.getItem('ptv_streamcounters_url') || '',
    };
}

// ── Mode toggle ───────────────────────────────────────────────────
function setMode(mode) {
    localStorage.setItem('ptv_mode', mode);
    document.getElementById('section-pokemon').classList.toggle('hidden', mode !== 'pokemon');
    document.getElementById('section-badges').classList.toggle('hidden',  mode !== 'badges');
    document.getElementById('mode-btn-pokemon').classList.toggle('active', mode === 'pokemon');
    document.getElementById('mode-btn-badges').classList.toggle('active',  mode === 'badges');
    if (mode === 'badges') schedulePreviewBadgeUpdate();
}

// ── Init sequence ────────────────────────────────────────────────
initExternalMode();
buildRows();
buildFontDropdown();
initColorPicker();
setLang(currentLang);
initCookieNotice();

// ── Randomlocke integration ────────────────────────────────────
var rlRoutes = [];
var rlSearchQuery = '';
var rlBotActive = false;

async function rlCheckAuth() {
    try {
        const user = currentUser || await fetch('/api/auth/me').then(r => r.ok ? r.json() : Promise.reject());
        document.getElementById('rl-section').classList.remove('hidden');
        document.getElementById('bot-channel-label').textContent = `#${user.username}`;
        return user;
    } catch {
        return null;
    }
}

function rlOpenModal() {
    document.getElementById('zones-modal').classList.remove('hidden');
    document.getElementById('route-search').focus();
}

function rlCloseModal() {
    document.getElementById('zones-modal').classList.add('hidden');
    document.getElementById('route-search').value = '';
    rlSearchQuery = '';
    rlRenderRoutes();
}

function rlRoutesUrl(suffix = '') {
    const base = '/api/randomlocke/routes' + suffix;
    return externalMode ? base + (suffix.includes('?') ? '&' : '?') + 'channel=' + encodeURIComponent(channelId) : base;
}

async function rlLoadRoutes() {
    try {
        const res = await fetch(rlRoutesUrl());
        if (!res.ok) throw new Error();
        rlRoutes = await res.json();
        rlRenderRoutes();
    } catch (e) {
        console.error('Failed to load routes', e);
    }
}

function rlRenderRoutes() {
    const list  = document.getElementById('route-list');
    const empty = document.getElementById('route-empty');
    const query = rlSearchQuery.toLowerCase();
    const filtered = query
        ? rlRoutes.filter(r => r.zoneName.toLowerCase().includes(query))
        : rlRoutes;

    if (!filtered.length) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    list.innerHTML = filtered.map(r => `
        <li data-id="${r.id}">
            <span>${escapeHtml(r.zoneName)}</span>
            <button onclick="rlDeleteRoute('${r.id}')" title="Eliminar">✕</button>
        </li>
    `).join('');
}

let rlFeedbackTimer = null;
function rlShowFeedback(key, isError = false) {
    const el = document.getElementById('route-feedback');
    if (!el) return;
    clearTimeout(rlFeedbackTimer);
    el.textContent = t(key);
    el.style.color = isError ? 'var(--error)' : 'var(--blue)';
    el.style.opacity = '1';
    rlFeedbackTimer = setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

async function rlAddRoute() {
    const input = document.getElementById('route-input');
    const zone  = input.value.trim();
    if (!zone) return;

    const normalized = zone.toLowerCase().replace(/\s+/g, ' ');
    if (rlRoutes.some(r => r.zoneName.toLowerCase() === normalized)) {
        input.select();
        rlShowFeedback('zoneDuplicate', true);
        return;
    }

    try {
        const res = await fetch(rlRoutesUrl(), {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ zone }),
        });
        if (!res.ok) throw new Error();
        const newRoute = await res.json();
        rlRoutes.unshift(newRoute);
        input.value = '';
        rlRenderRoutes();
        rlShowFeedback('zoneAdded');
    } catch (e) {
        console.error('Failed to add route', e);
        rlShowFeedback('zoneError', true);
    }
}

async function rlDeleteRoute(id) {
    try {
        const res = await fetch(rlRoutesUrl(`/${id}`), { method: 'DELETE' });
        if (!res.ok) throw new Error();
        rlRoutes = rlRoutes.filter(r => r.id !== id);
        rlRenderRoutes();
    } catch (e) {
        console.error('Failed to delete route', e);
    }
}

async function rlClearAllRoutes() {
    if (!rlRoutes.length) return;
    if (!confirm(t('clearAllConfirm'))) return;
    try {
        const res = await fetch(rlRoutesUrl(), { method: 'DELETE' });
        if (!res.ok) throw new Error();
        rlRoutes = [];
        rlRenderRoutes();
        rlShowFeedback('zonesCleared');
    } catch (e) {
        console.error('Failed to clear routes', e);
        rlShowFeedback('zonesClearError', true);
    }
}

function rlIsValidUrl(val) {
    try {
        return new URL(val).hostname === 'streamcounters.mrklypp.com';
    } catch { return false; }
}

function rlApplyCounterUrl(url) {
    const frame = document.getElementById('counter-frame');
    const error = document.getElementById('counter-url-error');
    if (!url) { frame.src = ''; error.classList.add('hidden'); return; }
    if (rlIsValidUrl(url)) {
        frame.src = url;
        error.classList.add('hidden');
    } else {
        frame.src = '';
        error.classList.remove('hidden');
    }
}

function rlInitLifeCounter() {
    const input = document.getElementById('counter-url');
    if (!input) return;
    input.addEventListener('blur', () => {
        saveState(false);
        rlApplyCounterUrl(input.value.trim());
    });
}

async function rlLoadBotStatus() {
    try {
        const res = await fetch('/api/randomlocke/bot/status');
        if (!res.ok) throw new Error();
        const { connected } = await res.json();
        rlSetBotUI(connected);
    } catch { rlSetBotUI(false); }
}

function rlSetBotUI(active) {
    rlBotActive = active;
    const dot   = document.getElementById('bot-dot');
    const label = document.getElementById('bot-status-label');
    const btn   = document.getElementById('bot-toggle-btn');
    if (!dot) return;
    dot.style.background = active ? '#22C55E' : 'var(--dimmed)';
    label.textContent    = t(active ? 'botConnected'  : 'botDisconnected');
    btn.textContent      = t(active ? 'deactivateBot' : 'activateBot');
}

async function rlToggleBot() {
    const btn = document.getElementById('bot-toggle-btn');
    btn.disabled = true;
    try {
        const endpoint = rlBotActive ? '/api/randomlocke/bot/stop' : '/api/randomlocke/bot/start';
        const res = await fetch(endpoint, { method: 'POST' });
        if (!res.ok) throw new Error();
        rlSetBotUI(!rlBotActive);
    } catch (e) {
        console.error('Bot toggle failed', e);
    } finally {
        btn.disabled = false;
    }
}

(async () => {
    if (!externalMode) {
        await initFromServer();
    }
    syncTypographyUI();
    updatePreview();
    updateObsHint();
    hydrateFromAbly();
    subscribeToAblyUpdates();
    renderPresets();

    if (!externalMode) {
        const user = await rlCheckAuth();
        if (!user) return;

        rlLoadRoutes();
        rlInitLifeCounter();
        rlLoadBotStatus();

        document.getElementById('route-add-btn').addEventListener('click', rlAddRoute);
        document.getElementById('route-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') rlAddRoute();
        });
        document.getElementById('route-search').addEventListener('input', e => {
            rlSearchQuery = e.target.value;
            rlRenderRoutes();
        });
        document.getElementById('bot-toggle-btn').addEventListener('click', rlToggleBot);
        document.getElementById('zones-modal-btn').addEventListener('click', rlOpenModal);
        document.getElementById('zones-modal-close').addEventListener('click', rlCloseModal);
        document.getElementById('zones-clear-btn').addEventListener('click', rlClearAllRoutes);
        document.getElementById('zones-modal').addEventListener('click', e => {
            if (e.target === e.currentTarget) rlCloseModal();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') rlCloseModal();
        });
    }
})();
