// ── i18n ────────────────────────────────────────────────────────
const STRINGS = {
    es: {
        subtitle1:     'Genera tu overlay de equipo Pokémon para OBS en segundos.',
        subtitle2:     'Escribe los nombres exactamente como aparecen en el juego.',
        warn:          'Si encuentras algún error, por favor házmelo saber.',
        importBtn:     '⬆ Importar equipo',
        layout:        'Diseño',
        horizontal:    'Horizontal',
        vertical:      'Vertical',
        showShadows:   'Mostrar sombras',
        showBg:        'Mostrar fondo de pokéball',
        generateBtn:   '⬇ Generar y descargar',
        resetBtn:      'Resetear datos',
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
        errNoData:     'No se encontraron datos en este archivo.',
        errRead:       'Error al leer el archivo.',
        confirmReset:  '¿Seguro que quieres resetear todos los datos?',
        successReset:  'Datos reseteados correctamente.',
        successDl:     '¡TeamVisualizer.html descargado!',
        successImport:    '¡Equipo importado correctamente!',
        obsHint:          dims => `Añade un <strong>Browser Source</strong> en OBS y selecciona <strong>TeamVisualizer.html</strong> como archivo local.<br>Tamaño recomendado: <strong>${dims}</strong><br>Puedes reemplazar el archivo directamente.`,
        livePreviewOn:    '👁 Vista previa en vivo',
        livePreviewOff:   '👁 Ocultar vista previa',
        previewVertical:  'La vista previa solo está disponible en modo horizontal.',
        shareBtn:         '🔗 Compartir equipo',
        shareCopied:      '¡Enlace copiado!',
        sharePromptCopy:  'Copia este enlace:',
        urlTeamLoaded:    '¡Equipo cargado desde el enlace compartido!',
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
    },
    en: {
        subtitle1:     'Generate your Pokémon team overlay for OBS in seconds.',
        subtitle2:     'Write Pokémon names exactly as they appear in-game.',
        warn:          'If you encounter any error, please let me know.',
        importBtn:     '⬆ Import team',
        layout:        'Layout',
        horizontal:    'Horizontal',
        vertical:      'Vertical',
        showShadows:   'Show shadows',
        showBg:        'Show pokéball background',
        generateBtn:   '⬇ Generate & Download',
        resetBtn:      'Reset all data',
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
        errNoData:     'No team data found in this file.',
        errRead:       'Error reading file.',
        confirmReset:  'Are you sure you want to reset all data?',
        successReset:  'Team data was reset successfully.',
        successDl:     'TeamVisualizer.html downloaded!',
        successImport:    'Team imported successfully!',
        obsHint:          dims => `Add a <strong>Browser Source</strong> in OBS and select <strong>TeamVisualizer.html</strong> as a local file.<br>Recommended size: <strong>${dims}</strong><br>You can replace the file directly.`,
        livePreviewOn:    '👁 Live preview',
        livePreviewOff:   '👁 Hide live preview',
        previewVertical:  'Live preview is only available in horizontal mode.',
        shareBtn:         '🔗 Share team',
        shareCopied:      'Link copied!',
        sharePromptCopy:  'Copy this link:',
        urlTeamLoaded:    'Team loaded from shared link!',
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
    }
};

let currentLang = localStorage.getItem('ptv_lang') || 'es';

function t(key, arg) {
    const val = STRINGS[currentLang][key];
    return typeof val === 'function' ? val(arg) : val;
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ptv_lang', lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    applyLang();
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
    updateObsHint();
    const btn = document.getElementById('btn-live-preview');
    if (btn) btn.textContent = t(previewVisible ? 'livePreviewOff' : 'livePreviewOn');
    for (let i = 0; i < 6; i++) refreshIcons(i);
    renderPresets();
}

// ── Constants ───────────────────────────────────────────────────
const BASE_URL     = 'https://pokemonteamvisualizer.pages.dev/sprites/';
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

const team = Array.from({ length: 6 }, () => ({
    name: '',
    mote: '',
    properties: { ...DEFAULT_PROPS }
}));

let pokemonNames = [];
let modalIndex   = -1;
let modalVars    = {};
let dragSrcIndex = -1;

// ── Load autocomplete list ──────────────────────────────────────
fetch('pokemon-list.json')
    .then(r => r.json())
    .then(names => {
        pokemonNames = names;
        for (let i = 0; i < 6; i++) refreshSprite(i);
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
            <img class="sprite-preview" src="" alt="" onclick="openModal(${i})" style="cursor:pointer">
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

            saveState();
        });
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
            document.querySelectorAll('.pokemon-row').forEach(r => r.classList.remove('drag-over'));
        });
        row.addEventListener('dragover', e => {
            e.preventDefault();
            if (dragSrcIndex !== i) row.classList.add('drag-over');
        });
        row.addEventListener('dragleave', e => {
            if (!row.contains(e.relatedTarget)) row.classList.remove('drag-over');
        });
        row.addEventListener('drop', e => {
            e.preventDefault();
            row.classList.remove('drag-over');
            const src = dragSrcIndex;
            if (src < 0 || src === i) return;
            const [item] = team.splice(src, 1);
            team.splice(i, 0, item);
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
        const fallbackUrl = BASE_URL + encodeURIComponent(name) + '.gif';
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
    const skins   = ['common', ...(catalog.skin || [])];
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

    modalVars.skin = props.skin;
    propsEl.innerHTML += `
        <div class="modal-row">
            <label>${t('modalSkin')}</label>
            <select id="mp-skin" onchange="modalVars.skin=this.value">
                ${skins.map(s => `<option value="${s}" ${props.skin===s?'selected':''}>${s}</option>`).join('')}
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

    if (skin !== 'common' && skins.includes(skin)) {
        fileName += '_' + skin;
    }
    if (shiny) {
        folder += 'shiny/';
    }
    if (gender === 'female' && hasFemale) {
        folder += 'female/';
    }

    return folder + encodeURIComponent(fileName) + '.gif';
}

// ── Generate HTML ───────────────────────────────────────────────
function buildOverlayHTML(layout, showShadows, showBg) {
    const dataBlock = JSON.stringify({ team, layout, shadows: showShadows, bg: showBg });
    const entries = team.map(slot => {
        if (!slot.name.trim()) return null;
        return {
            mote: (slot.mote || slot.name).toUpperCase(),
            url:  buildSpriteUrl(slot.name.trim(), slot.properties)
        };
    });

    const isHorizontal = layout === 'horizontal';

    const pkDivContent = entries.map((e, i) => {
        if (!e) return '';
        let c = `<p>${e.mote}</p>`;
        if (showBg) c += `<img id="pokeballBackground${i+1}" src="${POKEBALL_URL}">`;
        c += `<img id="img${i+1}" src="${e.url}">`;
        return c;
    });

    const shadowContent = entries.map((e, i) =>
        e && showShadows ? `<img id="shadow${i+1}" src="${SHADOW_URL}">` : `<img id="shadow${i+1}">`
    );

    if (isHorizontal) {
        return `<html>
<head>
<meta charset="UTF-8">
<script type="application/json" id="ptv-data">${dataBlock}<${'/script>'}
<link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
<style>
body,html{margin:0;padding:0;}
.pkDiv{width:225px;height:150px;float:left;}
#pokeballBackground1,#pokeballBackground2,#pokeballBackground3,#pokeballBackground4,#pokeballBackground5,#pokeballBackground6{position:absolute;width:225px;height:150px;z-index:-1;}
.shadowDiv{width:225px;height:150px;float:left;padding-top:80px;}
img{width:100%;max-width:100%;max-height:100%;object-fit:contain;pointer-events:none;user-select:none;}
p{height:25px;color:white;text-align:center;font-family:Anton,'Arial Narrow Bold',sans-serif;font-size:35px;text-shadow:3px 3px 0 #000,-3px 3px 0 #000,-3px -3px 0 #000,3px -3px 0 #000;}
.container{clear:both;}
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
<div class="container">
${entries.map((e, i) => e ? `<div class="pkDiv">${pkDivContent[i]}</div>` : '').join('\n')}
</div>
<div class="container">
${entries.map((e, i) => e ? `<div class="shadowDiv">${shadowContent[i]}</div>` : '').join('\n')}
</div>
</body>
</html>`;
    } else {
        return `<html>
<head>
<meta charset="UTF-8">
<script type="application/json" id="ptv-data">${dataBlock}<${'/script>'}
<link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">
<style>
body,html{margin:0;padding:0;}
.wrapper{display:flex;flex-direction:column;}
.pair{display:flex;flex-direction:column;margin:0;padding:0;margin-bottom:20px;width:225px;align-items:center;}
.pkDiv,.shadowDiv{margin:0;padding:0;}
.pkDiv{width:225px;}
.shadowDiv{width:150px;margin-top:-15px;}
#pokeballBackground1,#pokeballBackground2,#pokeballBackground3,#pokeballBackground4,#pokeballBackground5,#pokeballBackground6{position:absolute;width:225px;height:150px;z-index:-1;}
img{display:block;width:100%;height:auto;max-height:100px;object-fit:contain;pointer-events:none;user-select:none;}
p{margin:0;padding:0;height:25px;color:white;font-family:Anton,'Arial Narrow Bold',sans-serif;font-size:25px;text-align:center;text-shadow:3px 3px 0 #000,-3px 3px 0 #000,-3px -3px 0 #000,3px -3px 0 #000;}
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
${entries.map((e, i) => e ? `<div class="pair">
  <div class="pkDiv">${pkDivContent[i]}</div>
  <div class="shadowDiv">${shadowContent[i]}</div>
</div>` : '').join('\n')}
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

// ── Download ────────────────────────────────────────────────────
function generateAndDownload() {
    const hasAny = team.some(s => s.name.trim());
    if (!hasAny) { setStatus(t('errNoName'), 'var(--error)'); return; }
    if (!validateTeam()) return;

    const html = buildOverlayHTML(
        document.getElementById('layout-select').value,
        document.getElementById('shadows-check').checked,
        document.getElementById('bg-check').checked
    );
    triggerDownload(html, 'TeamVisualizer.html');
    setStatus(t('successDl'), 'var(--success)');
}

function triggerDownload(content, filename) {
    const blob = new Blob([content], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Import ───────────────────────────────────────────────────────
function importTeam(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const match = e.target.result.match(/<script type="application\/json" id="ptv-data">([\s\S]*?)<\/script>/);
        if (!match) { setStatus(t('errNoData'), 'var(--error)'); return; }
        try {
            const data = JSON.parse(match[1]);
            data.team.forEach((slot, i) => {
                if (i >= 6) return;
                team[i] = { name: slot.name || '', mote: slot.mote || '', properties: { ...DEFAULT_PROPS, ...(slot.properties || {}) } };
                const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
                row.querySelector('.name-input').value = team[i].name;
                row.querySelector('.mote-input').value = team[i].mote;
                refreshIcons(i);
                refreshSprite(i);
            });
            if (data.layout)               document.getElementById('layout-select').value   = data.layout;
            if (data.shadows !== undefined) document.getElementById('shadows-check').checked = data.shadows;
            if (data.bg      !== undefined) document.getElementById('bg-check').checked      = data.bg;
            updateObsHint();
            saveState();
            setStatus(t('successImport'), 'var(--success)');
        } catch(_) { setStatus(t('errRead'), 'var(--error)'); }
        input.value = '';
    };
    reader.readAsText(file);
}

// ── Live preview ─────────────────────────────────────────────────
let previewVisible = true;
let previewTimeout = null;

function togglePreview() {
    previewVisible = !previewVisible;
    document.getElementById('preview-card').style.display = previewVisible ? '' : 'none';
    document.getElementById('btn-live-preview').textContent = t(previewVisible ? 'livePreviewOff' : 'livePreviewOn');
    if (previewVisible) updatePreview();
}

function schedulePreviewUpdate() {
    if (!previewVisible) return;
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(updatePreview, 300);
}

function updatePreview() {
    if (!previewVisible) return;
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

    const scale = containerW / 1350;
    iframe.style.width     = '1350px';
    iframe.style.height    = '265px';
    iframe.style.transform = `scale(${scale})`;
    wrapper.style.width    = Math.round(1350 * scale) + 'px';
    wrapper.style.height   = Math.round(265  * scale) + 'px';
    wrapper.style.margin   = '0';

    iframe.srcdoc = buildOverlayHTML('horizontal', shadows, bg);
}

// ── Persistence ─────────────────────────────────────────────────
function saveState() {
    localStorage.setItem('ptv_team',    JSON.stringify(team));
    localStorage.setItem('ptv_layout',  document.getElementById('layout-select').value);
    localStorage.setItem('ptv_shadows', document.getElementById('shadows-check').checked);
    localStorage.setItem('ptv_bg',      document.getElementById('bg-check').checked);
    schedulePreviewUpdate();
}

function loadState() {
    const saved = localStorage.getItem('ptv_team');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        data.forEach((slot, i) => {
            if (i >= 6) return;
            team[i] = { name: slot.name || '', mote: slot.mote || '', properties: { ...DEFAULT_PROPS, ...(slot.properties || {}) } };
            const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
            row.querySelector('.name-input').value = team[i].name;
            row.querySelector('.mote-input').value = team[i].mote;
            refreshIcons(i);
            refreshSprite(i);
        });
    } catch(e) {}

    const layout = localStorage.getItem('ptv_layout');
    if (layout) document.getElementById('layout-select').value = layout;

    const shadows = localStorage.getItem('ptv_shadows');
    if (shadows !== null) document.getElementById('shadows-check').checked = shadows === 'true';

    const bg = localStorage.getItem('ptv_bg');
    if (bg !== null) document.getElementById('bg-check').checked = bg === 'true';
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
    const layout = document.getElementById('layout-select').value;
    const dims   = layout === 'horizontal' ? '1350x265' : '265x1350';
    document.getElementById('obs-hint').innerHTML = t('obsHint', dims);
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
    try { return JSON.parse(localStorage.getItem('ptv_preset_' + slot)); } catch(_) { return null; }
}
function setPreset(slot, data) {
    localStorage.setItem('ptv_preset_' + slot, JSON.stringify(data));
}

function savePreset(slot) {
    const existing = getPreset(slot);
    const defaultName = existing ? existing.name : t('presetDefault', slot + 1);
    const name = prompt(t('presetSavePrompt'), defaultName);
    if (name === null) return;
    setPreset(slot, {
        name: name.trim() || defaultName,
        team: JSON.parse(JSON.stringify(team)),
        layout: document.getElementById('layout-select').value,
        shadows: document.getElementById('shadows-check').checked,
        bg: document.getElementById('bg-check').checked
    });
    renderPresets();
    setStatus(t('presetSaved'), 'var(--success)');
}

function loadPreset(slot) {
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
    updateObsHint();
    saveState();
    setStatus(t('presetLoaded'), 'var(--success)');
}

function deletePreset(slot) {
    localStorage.removeItem('ptv_preset_' + slot);
    renderPresets();
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

// ── URL sharing ───────────────────────────────────────────────────
function encodeTeam() {
    const data = team.map(s => [s.name, s.mote, s.properties.gender, s.properties.skin, s.properties.shiny]);
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    return btoa(String.fromCharCode(...bytes));
}

function decodeTeam(str) {
    const binary = atob(str);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
}

function shareTeam() {
    const hasAny = team.some(s => s.name.trim());
    if (!hasAny) { setStatus(t('errNoName'), 'var(--error)'); return; }
    const url = location.href.split('#')[0] + '#team=' + encodeTeam();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            setStatus(t('shareCopied'), 'var(--success)');
        }).catch(() => prompt(t('sharePromptCopy'), url));
    } else {
        prompt(t('sharePromptCopy'), url);
    }
}

function loadFromUrl() {
    const hash = location.hash;
    if (!hash.startsWith('#team=')) return;
    try {
        const data = decodeTeam(hash.slice(6));
        if (!Array.isArray(data) || data.length !== 6) return;
        data.forEach(([name, mote, gender, skin, shiny], i) => {
            if (i >= 6) return;
            team[i] = { name: name || '', mote: mote || '', properties: { gender: gender || 'male', skin: skin || 'common', shiny: shiny || 'False' } };
            const row = document.querySelector(`.pokemon-row[data-index="${i}"]`);
            if (!row) return;
            row.querySelector('.name-input').value = team[i].name;
            row.querySelector('.mote-input').value = team[i].mote;
            refreshIcons(i);
            refreshSprite(i);
        });
        saveState();
        setStatus(t('urlTeamLoaded'), 'var(--success)');
    } catch(_) {}
}

// ── Init ─────────────────────────────────────────────────────────
buildRows();
loadState();
loadFromUrl();
setLang(currentLang);
updatePreview();
window.addEventListener('hashchange', loadFromUrl);
