// TYPES, TYPE_COLORS, TYPE_NAMES, TYPE_CHART, PK_SLUG_EXCEPTIONS, SKIN_SLUG_MAP, toPokeApiSlug
// are defined in type-chart.js — loaded before this script in types.html

const TYPE_STRINGS = {
    es: {
        noTypeSelected:  'Selecciona uno o dos tipos para ver la efectividad.',
        resetBtn:        'Resetear',
        selectorHint:    'Elige el tipo del que quieres ver las debilidades.',
        pokemonSearchPh: 'Buscar Pokémon...',
        pokemonBase:     'Base',
        loadingTypes:    'Cargando...',
        unknownPokemon:  'Pokémon no encontrado',
        propsBtn:        'Propiedades',
        modalTitle:      'Propiedades',
        modalSkin:       'Forma',
        modalGender:     'Género',
        modalShiny:      'Shiny',
        modalSet:        'Guardar',
        statsSection:     'Stats base',
        abilitiesSection: 'Habilidades',
        evoSection:       'Cadena evolutiva',
        hiddenAbility:    'oculta',
        badgeCommon:      'Común',
        badgeLegendary:   'Legendario',
        badgeMythic:      'Mítico',
        badgeBaby:        'Bebé',
        statHp:    'HP',        statAtk:   'Ataque',
        statDef:   'Defensa',   statSpAtk: 'Sp.Atk',
        statSpDef: 'Sp.Def',    statSpd:   'Velocidad',
        evoLevel:  'nv.',       evoTrade:  'intercambio',
        evoHappiness: 'amistad',  evoAffection: 'afinidad',
        evoLocation: 'lugar',
    },
    en: {
        noTypeSelected:  'Select one or two types to see effectiveness.',
        resetBtn:        'Reset',
        selectorHint:    'Choose the type whose weaknesses you want to see.',
        pokemonSearchPh: 'Search Pokémon...',
        pokemonBase:     'Base',
        loadingTypes:    'Loading...',
        unknownPokemon:  'Pokémon not found',
        propsBtn:        'Properties',
        modalTitle:      'Properties',
        modalSkin:       'Form',
        modalGender:     'Gender',
        modalShiny:      'Shiny',
        modalSet:        'Save',
        statsSection:     'Base Stats',
        abilitiesSection: 'Abilities',
        evoSection:       'Evolution Chain',
        hiddenAbility:    'hidden',
        badgeCommon:      'Common',
        badgeLegendary:   'Legendary',
        badgeMythic:      'Mythical',
        badgeBaby:        'Baby',
        statHp:    'HP',        statAtk:   'Attack',
        statDef:   'Defense',   statSpAtk: 'Sp.Atk',
        statSpDef: 'Sp.Def',    statSpd:   'Speed',
        evoLevel:  'lv.',       evoTrade:  'trade',
        evoHappiness: 'friendship', evoAffection: 'affection',
        evoLocation: 'location',
    }
};

function tT(key) {
    return TYPE_STRINGS[currentLang][key];
}

let selectedTypes   = [];
let pkSearchNames   = [];
let selectedPokemon = { name: '', skin: '', types: [], abilities: [], stats: [] };
let typeProps       = { skin: '', shiny: 'False', gender: 'male' };
let typeModalProps  = {};
let typeResolveId   = 0;
let pkSpeciesData        = null;
let pkChainData          = null;
let pkCurrentSpeciesName = '';
let pkAbilityNames       = {};
let SPRITE_VER      = '';

Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
]).then(([names]) => {
    pkSearchNames = names;
});


function calcDefense(types) {
    const result = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] };
    for (const atk of TYPES) {
        let mult = 1;
        for (const def of types) {
            mult *= TYPE_CHART[def][atk];
        }
        if (result[mult] !== undefined) result[mult].push(atk);
    }
    return result;
}

function toggleType(type) {
    const idx = selectedTypes.indexOf(type);
    if (idx !== -1) {
        selectedTypes.splice(idx, 1);
    } else {
        if (selectedTypes.length >= 2) selectedTypes.shift();
        selectedTypes.push(type);
    }
    renderTypeSelector();
    renderTable();
}

function renderTypeSelector() {
    const grid = document.getElementById('type-grid');
    grid.innerHTML = '';
    for (const type of TYPES) {
        const btn = document.createElement('button');
        btn.className = 'type-btn' + (selectedTypes.includes(type) ? ' selected' : '');
        btn.innerHTML = `<img src="sprites/types/${type}.webp?v=2" alt="" class="type-icon">${TYPE_NAMES[currentLang][type]}`;
        btn.style.background = TYPE_ICON_COLORS[type] || TYPE_COLORS[type];
        btn.onclick = () => toggleType(type);
        grid.appendChild(btn);
    }
}

function renderTable() {
    const container = document.getElementById('types-table');
    if (selectedTypes.length === 0) {
        container.innerHTML = `<p class="types-placeholder">${tT('noTypeSelected')}</p>`;
        return;
    }
    const groups = calcDefense(selectedTypes);
    const MULT_ORDER = [4, 2, 1, 0.5, 0.25, 0];
    let html = '';
    for (const mult of MULT_ORDER) {
        const types = groups[mult];
        if (!types || types.length === 0) continue;
        html += `<div class="mult-row">
            <span class="mult-label">×${mult}</span>
            <div class="mult-chips">${types.map(t =>
                `<span class="type-chip" style="background:${TYPE_ICON_COLORS[t] || TYPE_COLORS[t]}"><img src="sprites/types/${t}.webp?v=2" alt="" class="type-icon">${TYPE_NAMES[currentLang][t]}</span>`
            ).join('')}</div>
        </div>`;
    }
    container.innerHTML = html;
}

function resetTypes() {
    selectedTypes = [];
    clearPkSearch();
    renderTypeSelector();
    renderTable();
}

function clearPkSearch() {
    selectedPokemon      = { name: '', skin: '', types: [], abilities: [], stats: [] };
    pkSpeciesData        = null;
    pkChainData          = null;
    pkCurrentSpeciesName = '';
    pkAbilityNames       = {};
    const input = document.getElementById('pk-search-input');
    if (input) input.value = '';
    closePkSuggestions();
    const propsRow = document.getElementById('pk-props-row');
    if (propsRow) propsRow.style.display = 'none';
    const result = document.getElementById('pk-result');
    if (result) result.style.display = 'none';
    const infoDiv = document.getElementById('pk-info');
    if (infoDiv) infoDiv.style.display = 'none';
    const error = document.getElementById('pk-error');
    if (error) error.style.display = 'none';
    const clearBtn = document.getElementById('pk-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
}

// ── Pokémon search ─────────────────────────────────────────────
function updatePkSuggestions() {
    const input = document.getElementById('pk-search-input');
    const list  = document.getElementById('pk-search-suggestions');
    const typed = input.value.toLowerCase();
    if (typed.length < 2) { closePkSuggestions(); return; }
    const starts  = pkSearchNames.filter(n => n.startsWith(typed));
    const rest    = pkSearchNames.filter(n => !n.startsWith(typed) && n.includes(typed));
    const matches = [...starts, ...rest].slice(0, 8);
    if (!matches.length) { closePkSuggestions(); return; }
    list.innerHTML = matches.map(n => `<li data-value="${n}">${n}</li>`).join('');
    list.style.display = 'block';
}

function closePkSuggestions() {
    const list = document.getElementById('pk-search-suggestions');
    list.innerHTML     = '';
    list.style.display = 'none';
}

function onPkSelect(name) {
    selectedPokemon = { name, skin: '', types: [] };
    document.getElementById('pk-search-input').value = name;
    closePkSuggestions();
    showPropsBtn(name);
}

function showPropsBtn(name) {
    const catalog  = (typeof POKEMON_CATALOG !== 'undefined') ? POKEMON_CATALOG[name] : null;
    const skipBase = catalog?.skipBase ?? false;
    const skins    = catalog?.skin ?? [];
    typeProps = {
        skin:   skipBase && skins.length ? skins[0] : '',
        shiny:  'False',
        gender: 'male'
    };
    selectedPokemon.skin = typeProps.skin;
    const row = document.getElementById('pk-props-row');
    if (row) row.style.display = 'flex';
    resolvePokemonTypes(name, typeProps.skin);
}

function openTypesModal() {
    const name = selectedPokemon.name;
    if (!name) return;
    document.getElementById('modal-title').textContent =
        name.charAt(0).toUpperCase() + name.slice(1) + ' — ' + tT('modalTitle');

    const catalog  = (typeof POKEMON_CATALOG !== 'undefined') ? POKEMON_CATALOG[name] : null;
    const skipBase = catalog?.skipBase ?? false;
    const skins    = skipBase ? (catalog?.skin ?? []) : ['', ...(catalog?.skin ?? [])];

    typeModalProps = { ...typeProps };

    document.getElementById('modal-props').innerHTML = `
        <div class="modal-row">
            <label>${tT('modalGender')}</label>
            <select id="mp-gender" onchange="typeModalProps.gender=this.value">
                <option value="male"   ${typeProps.gender === 'male'   ? 'selected' : ''}>male</option>
                <option value="female" ${typeProps.gender === 'female' ? 'selected' : ''}>female</option>
            </select>
        </div>
        <div class="modal-row">
            <label>${tT('modalSkin')}</label>
            <select id="mp-skin" onchange="typeModalProps.skin=this.value">
                ${skins.map(s => `<option value="${s}" ${typeProps.skin === s ? 'selected' : ''}>${s || tT('pokemonBase')}</option>`).join('')}
            </select>
        </div>
        <div class="modal-row">
            <label>${tT('modalShiny')}</label>
            <select id="mp-shiny" onchange="typeModalProps.shiny=this.value">
                <option value="False" ${typeProps.shiny === 'False' ? 'selected' : ''}>False</option>
                <option value="True"  ${typeProps.shiny === 'True'  ? 'selected' : ''}>True</option>
            </select>
        </div>`;

    document.getElementById('modal-backdrop').classList.add('open');
}

function applyTypesModal() {
    typeProps = { ...typeModalProps };
    selectedPokemon.skin = typeProps.skin;
    closeTypesModal();
    resolvePokemonTypes(selectedPokemon.name, typeProps.skin);
}

function closeTypesModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', e => {
        if (e.target === backdrop) closeTypesModal();
    });
});


const STAT_KEYS = {
    'hp':               'statHp',
    'attack':           'statAtk',
    'defense':          'statDef',
    'special-attack':   'statSpAtk',
    'special-defense':  'statSpDef',
    'speed':            'statSpd',
};

function statColor(v) {
    if (v < 50)  return '#E5173A';
    if (v < 90)  return '#FF7A00';
    if (v < 120) return '#FFD700';
    if (v < 150) return '#3AC45A';
    return '#4A9EFF';
}


async function resolvePokemonTypes(name, skin) {
    const reqId     = ++typeResolveId;
    const capSkin   = skin;
    const capShiny  = typeProps.shiny;
    const capGender = typeProps.gender;

    const resultDiv = document.getElementById('pk-result');
    const errorEl   = document.getElementById('pk-error');
    const typesDiv  = document.getElementById('pk-result-types');
    const infoDiv   = document.getElementById('pk-info');

    resultDiv.style.display = 'none';
    errorEl.style.display   = 'none';
    if (infoDiv) infoDiv.style.display = 'none';
    typesDiv.innerHTML = `<span style="color:var(--text-2)">${tT('loadingTypes')}</span>`;

    const slug = toPokeApiSlug(name, capSkin);
    let data;
    try {
        let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
        if (!res.ok && capSkin) {
            res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toPokeApiSlug(name, null)}`);
        }
        if (!res.ok) throw new Error('not found');
        data = await res.json();
    } catch {
        if (reqId !== typeResolveId) return;
        errorEl.textContent   = tT('unknownPokemon');
        errorEl.style.display = 'block';
        return;
    }

    if (reqId !== typeResolveId) return;

    const types = data.types
        .map(t => t.type.name)
        .filter(t => TYPES.includes(t))
        .slice(0, 2);

    selectedPokemon.types     = types;
    selectedPokemon.abilities = data.abilities;
    selectedPokemon.stats     = data.stats;
    pkCurrentSpeciesName      = data.species.name;
    pkSpeciesData             = null;
    pkChainData               = null;

    selectedTypes = [...types];
    renderTypeSelector();
    renderTable();

    const catalog  = (typeof POKEMON_CATALOG !== 'undefined') ? POKEMON_CATALOG[name] : null;
    const skins    = catalog?.skin ?? [];
    const skinPart = (capSkin && skins.includes(capSkin)) ? `_${capSkin}` : '';
    let spriteFile;
    if (capShiny === 'True') {
        spriteFile = `sprites/Showdown/shiny/${name}${skinPart}.gif`;
    } else if (capGender === 'female') {
        spriteFile = `sprites/Showdown/female/${name}${skinPart}.gif`;
    } else {
        spriteFile = `sprites/Showdown/${name}${skinPart}.gif`;
    }
    const sprite = document.getElementById('pk-result-sprite');
    sprite.onerror = () => { sprite.onerror = null; sprite.src = `sprites/Showdown/${name}.gif` + SPRITE_VER; };
    sprite.src = spriteFile + SPRITE_VER;

    renderPkResult();
    resultDiv.style.display = 'flex';

    // Stats render immediately; abilities wait for translated names
    renderPkStats(data.stats);

    // Parallel fetch: species + all ability details (for translated names)
    try {
        const [speciesData, ...abilityDetails] = await Promise.all([
            fetch(data.species.url).then(r => r.json()),
            ...data.abilities.map(a =>
                fetch(a.ability.url).then(r => r.ok ? r.json() : null).catch(() => null)
            ),
        ]);
        if (reqId !== typeResolveId) return;

        // Build ability name + description map
        const cleanAbilityDesc = s => s?.replace(/[\f\n\r]+/g, ' ').replace(/  +/g, ' ').trim() ?? '';
        pkAbilityNames = {};
        data.abilities.forEach((a, i) => {
            const detail = abilityDetails[i];
            const slug   = a.ability.name;
            const ftes   = detail?.flavor_text_entries;
            const ft  = lang => cleanAbilityDesc(ftes?.filter(e => e.language.name === lang).pop()?.flavor_text);
            const eff = lang => cleanAbilityDesc(detail?.effect_entries?.find(e => e.language.name === lang)?.short_effect);
            pkAbilityNames[slug] = {
                es:      detail?.names?.find(n => n.language.name === 'es')?.name ?? slug.replace(/-/g, ' '),
                en:      detail?.names?.find(n => n.language.name === 'en')?.name ?? slug.replace(/-/g, ' '),
                desc_es: ft('es') || ft('en') || eff('es') || eff('en'),
                desc_en: ft('en') || ft('es') || eff('en') || eff('es'),
            };
        });

        pkSpeciesData = speciesData;
        renderPkBadge(pkSpeciesData);
        renderPkAbilities(data.abilities);

        const chainRes = await fetch(speciesData.evolution_chain.url);
        if (reqId !== typeResolveId) return;
        if (!chainRes.ok) throw new Error('chain not found');
        pkChainData = await chainRes.json();
        if (reqId !== typeResolveId) return;
        const hasEvo = renderPkEvo(pkChainData.chain, pkCurrentSpeciesName);
        if (hasEvo && infoDiv) infoDiv.style.display = 'flex';
    } catch {
        // non-critical — silently skip on error
    }
}

function renderPkResult() {
    const typesDiv = document.getElementById('pk-result-types');
    if (!typesDiv || !selectedPokemon.types.length) return;
    typesDiv.innerHTML = selectedPokemon.types.map(t =>
        `<span class="type-chip" style="background:${TYPE_ICON_COLORS[t] || TYPE_COLORS[t]}">` +
        `<img src="sprites/types/${t}.webp?v=2" alt="" class="type-icon">` +
        `${TYPE_NAMES[currentLang][t]}</span>`
    ).join('');
}

function renderPkStats(stats) {
    const el = document.getElementById('pk-info-stats');
    if (!el || !stats.length) return;
    const rows = stats
        .filter(s => STAT_KEYS[s.stat.name])
        .map(s => {
            const label = tT(STAT_KEYS[s.stat.name]);
            const pct   = Math.round((s.base_stat / 255) * 100);
            const color = statColor(s.base_stat);
            return `<div class="pk-stat-row">
                <span class="pk-stat-name">${label}</span>
                <div class="pk-stat-bar-track">
                    <div class="pk-stat-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="pk-stat-value">${s.base_stat}</span>
            </div>`;
        }).join('');
    el.innerHTML = `<div class="pk-info-label">${tT('statsSection')}</div>
        <div class="pk-stat-list">${rows}</div>`;
}

function renderPkAbilities(abilities) {
    const el = document.getElementById('pk-info-abilities');
    if (!el || !abilities.length) return;
    const chips = abilities.map(a => {
        const slug = a.ability.name;
        const name = pkAbilityNames[slug]?.[currentLang] ?? slug.replace(/-/g, ' ');
        const hiddenLabel = a.is_hidden
            ? ` <span class="pk-ability-hidden-label">(${tT('hiddenAbility')})</span>`
            : '';
        return `<span class="pk-ability-chip${a.is_hidden ? ' is-hidden-ability' : ''}" data-ability-slug="${slug}">${name}${hiddenLabel}</span>`;
    }).join('');
    el.innerHTML = `<div class="pk-info-label">${tT('abilitiesSection')}</div>
        <div class="pk-ability-chips">${chips}</div>`;
}

function renderPkBadge(species) {
    const el = document.getElementById('pk-info-badge');
    if (!el) return;
    let label, bg, color, borderColor;
    if (species.is_baby) {
        label = tT('badgeBaby');
        bg = 'rgba(255,86,180,0.15)';
        color = 'var(--accent)';
        borderColor = 'rgba(255,86,180,0.35)';
    } else if (species.is_legendary) {
        label = tT('badgeLegendary');
        bg = 'rgba(255,215,0,0.15)';
        color = '#FFD700';
        borderColor = 'rgba(255,215,0,0.35)';
    } else if (species.is_mythical) {
        label = tT('badgeMythic');
        bg = 'rgba(0,204,255,0.15)';
        color = 'var(--cyan)';
        borderColor = 'rgba(0,204,255,0.35)';
    } else {
        label = tT('badgeCommon');
        bg = 'rgba(255,255,255,0.06)';
        color = 'var(--text-2)';
        borderColor = 'var(--border)';
    }
    el.innerHTML = `<span class="pk-status-badge" style="background:${bg};color:${color};border-color:${borderColor}">${label}</span>`;
}

const EVO_ITEM_NAMES = {
    'water-stone':        { es: 'Piedra Agua',           en: 'Water Stone' },
    'fire-stone':         { es: 'Piedra Fuego',          en: 'Fire Stone' },
    'thunder-stone':      { es: 'Piedra Trueno',         en: 'Thunder Stone' },
    'leaf-stone':         { es: 'Piedra Hoja',           en: 'Leaf Stone' },
    'moon-stone':         { es: 'Piedra Lunar',          en: 'Moon Stone' },
    'sun-stone':          { es: 'Piedra Solar',          en: 'Sun Stone' },
    'shiny-stone':        { es: 'Piedra Día',            en: 'Shiny Stone' },
    'dusk-stone':         { es: 'Piedra Noche',          en: 'Dusk Stone' },
    'dawn-stone':         { es: 'Piedra Alba',           en: 'Dawn Stone' },
    'ice-stone':          { es: 'Piedra Hielo',          en: 'Ice Stone' },
    'oval-stone':         { es: 'Piedra Oval',           en: 'Oval Stone' },
    'kings-rock':         { es: 'Roca del Rey',          en: "King's Rock" },
    'metal-coat':         { es: 'Revestimiento Metálico', en: 'Metal Coat' },
    'dragon-scale':       { es: 'Escama Dragón',         en: 'Dragon Scale' },
    'upgrade':            { es: 'Mejora',                en: 'Upgrade' },
    'deep-sea-tooth':     { es: 'Diente Marino',          en: 'Deep Sea Tooth' },
    'deep-sea-scale':     { es: 'Escama Marina',          en: 'Deep Sea Scale' },
    'prism-scale':        { es: 'Escama Bella',          en: 'Prism Scale' },
    'sachet':             { es: 'Saquito Fragante',      en: 'Sachet' },
    'whipped-dream':      { es: 'Dulce de Nata',         en: 'Whipped Dream' },
    'protector':          { es: 'Protector',             en: 'Protector' },
    'electirizer':        { es: 'Electrizador',          en: 'Electirizer' },
    'magmarizer':         { es: 'Magmatizador',          en: 'Magmarizer' },
    'dubious-disc':       { es: 'Disco Extraño',         en: 'Dubious Disc' },
    'razor-fang':         { es: 'Colmillo Agudo',        en: 'Razor Fang' },
    'razor-claw':         { es: 'Garra Afilada',         en: 'Razor Claw' },
    'reaper-cloth':       { es: 'Tela Terrible',         en: 'Reaper Cloth' },
    'linking-cord':       { es: 'Cordón Unión',          en: 'Linking Cord' },
    'peat-block':         { es: 'Bloque de Turba',       en: 'Peat Block' },
    'black-augurite':     { es: 'Mineral Negro',         en: 'Black Augurite' },
    'auspicious-armor':   { es: 'Armadura Auspiciosa',   en: 'Auspicious Armor' },
    'malicious-armor':    { es: 'Armadura Maldita',       en: 'Malicious Armor' },
    'scroll-of-darkness': { es: 'Manuscrito de las Sombras', en: 'Scroll of Darkness' },
    'scroll-of-waters':   { es: 'Manuscrito de las Aguas',   en: 'Scroll of Waters' },
    'leaders-crest':      { es: 'Distintivo de Líder',   en: "Leader's Crest" },
    'galarica-cuff':      { es: 'Brazal Galanuez',       en: 'Galarica Cuff' },
    'galarica-wreath':    { es: 'Corona Galanuez',       en: 'Galarica Wreath' },
    'chipped-pot':        { es: 'Tetera Rota',           en: 'Chipped Pot' },
    'cracked-pot':        { es: 'Tetera Agrietada',      en: 'Cracked Pot' },
    'sweet-apple':        { es: 'Manzana Dulce',         en: 'Sweet Apple' },
    'tart-apple':         { es: 'Manzana Ácida',         en: 'Tart Apple' },
    'strawberry-sweet':   { es: 'Confite Fresa',         en: 'Strawberry Sweet' },
    'love-sweet':         { es: 'Confite Corazón',       en: 'Love Sweet' },
    'berry-sweet':        { es: 'Confite Fruto',         en: 'Berry Sweet' },
    'clover-sweet':       { es: 'Confite Trébol',        en: 'Clover Sweet' },
    'flower-sweet':       { es: 'Confite Flor',          en: 'Flower Sweet' },
    'ribbon-sweet':       { es: 'Confite Lazo',          en: 'Ribbon Sweet' },
    'star-sweet':         { es: 'Confite Estrella',      en: 'Star Sweet' },
};

const TRIGGER_LABELS = {
    'shed':                 { es: 'muda',              en: 'shed' },
    'spin':                 { es: 'girar',             en: 'spin' },
    'tower-of-darkness':    { es: 'Torre Sombras',     en: 'Tower of Darkness' },
    'tower-of-waters':      { es: 'Torre Aguas',       en: 'Tower of Waters' },
    'three-critical-hits':  { es: '3 golpes críticos', en: '3 critical hits' },
    'take-damage':          { es: 'recibir daño',      en: 'take damage' },
    'agile-style-move':     { es: 'estilo ágil',       en: 'agile style' },
    'strong-style-move':    { es: 'estilo fuerte',     en: 'strong style' },
    'recoil-damage':        { es: 'daño retroceso',    en: 'recoil damage' },
    'other':                { es: 'especial',          en: 'special' },
};

const EVO_SPECIAL_CASES = {
    'kingambit':   { es: 'Distintivo de Líder + vencer 3 Bisharp', en: "Leader's Crest + defeat 3 Bisharp" },
    'annihilape':  { es: 'Puño Furia ×20',                         en: 'Rage Fist ×20' },
    'gholdengo':   { es: '999 monedas Gimmighoul',                 en: '999 Gimmighoul Coins' },
    'palafin':     { es: 'nv.38 + Círculo de Unión',               en: 'lv.38 + Union Circle' },
    'rabsca':      { es: '1000 pasos Let\'s Go',                   en: "1000 Let's Go steps" },
    'runerigus':   { es: 'recibir daño + arco de piedra',          en: 'take damage + stone arch' },
    'dudunsparce': { es: 'nv.32 + Hipertaladro',                   en: 'lv.32 + Hyper Drill' },
};

function evoMethodLabel(details, speciesName) {
    if (!details || !details.length) return '';

    if (speciesName && EVO_SPECIAL_CASES[speciesName])
        return EVO_SPECIAL_CASES[speciesName][currentLang];

    // First pass: prefer use-item, trade, or spin+item (clearest methods)
    for (const d of details) {
        if (d.trigger?.name === 'spin' && d.held_item?.name) {
            const item = EVO_ITEM_NAMES[d.held_item.name]?.[currentLang] ?? d.held_item.name.replace(/-/g, ' ');
            return `${TRIGGER_LABELS['spin'][currentLang]} + ${item}`;
        }
        if (d.trigger?.name === 'use-item' && d.item?.name)
            return EVO_ITEM_NAMES[d.item.name]?.[currentLang] ?? d.item.name.replace(/-/g, ' ');
        if (d.trigger?.name === 'trade')
            return tT('evoTrade');
    }

    // Second pass: specific level-up conditions
    for (const d of details) {
        if (d.min_level)         return `${tT('evoLevel')}${d.min_level}`;
        if (d.min_happiness)     return tT('evoHappiness');
        if (d.min_affection)     return tT('evoAffection');
        if (d.known_move_type)   return tT('evoAffection');
        if (d.location)          return tT('evoLocation');
        if (d.held_item?.name)   return EVO_ITEM_NAMES[d.held_item.name]?.[currentLang] ?? d.held_item.name.replace(/-/g, ' ');
    }

    if (details.some(d => d.trigger?.name === 'level-up'))
        return `${tT('evoLevel')}?`;
    const trigger = details[0].trigger?.name;
    return TRIGGER_LABELS[trigger]?.[currentLang] ?? trigger?.replace(/-/g, ' ') ?? '';
}

function evoNodeHTML(speciesName, selectedSpeciesName) {
    const isSelected = speciesName === selectedSpeciesName;
    return `<div class="pk-evo-node${isSelected ? ' selected' : ''}" onclick="onPkSelect('${speciesName}')" role="button" tabindex="0">
        <img src="sprites/${speciesName}.gif${SPRITE_VER}" alt="${speciesName}" loading="lazy"
             onerror="this.style.display='none'">
        <span class="pk-evo-node-name">${speciesName}</span>
    </div>`;
}

function collectLinear(node) {
    if (node.evolves_to.length === 0) return [node];
    if (node.evolves_to.length > 1)   return null;
    const rest = collectLinear(node.evolves_to[0]);
    return rest ? [node, ...rest] : null;
}

function renderChainNode(node, selectedSpeciesName) {
    const linear = collectLinear(node);
    if (linear) {
        let html = '<div class="pk-evo-row">';
        for (let i = 0; i < linear.length; i++) {
            if (i > 0) {
                const method = evoMethodLabel(linear[i].evolution_details, linear[i].species.name);
                html += `<div class="pk-evo-arrow">
                    <span class="pk-evo-arrow-method">${method}</span>
                    <span class="pk-evo-arrow-icon">→</span>
                </div>`;
            }
            html += evoNodeHTML(linear[i].species.name, selectedSpeciesName);
        }
        html += '</div>';
        return html;
    }

    // Branching node
    const parentHTML   = evoNodeHTML(node.species.name, selectedSpeciesName);
    const childrenHTML = node.evolves_to.map(child => {
        const method = evoMethodLabel(child.evolution_details, child.species.name);
        return `<div class="pk-evo-row">
            <div class="pk-evo-arrow">
                <span class="pk-evo-arrow-method">${method}</span>
                <span class="pk-evo-arrow-icon">→</span>
            </div>
            ${renderChainNode(child, selectedSpeciesName)}
        </div>`;
    }).join('');

    return `<div class="pk-evo-row">
        ${parentHTML}
        <div class="pk-evo-children">${childrenHTML}</div>
    </div>`;
}

function renderPkEvo(chain, selectedSpeciesName) {
    const el = document.getElementById('pk-info-evo');
    if (!el) return false;
    if (!chain.evolves_to || !chain.evolves_to.length) {
        el.innerHTML = '';
        return false;
    }
    el.innerHTML = `<div class="pk-info-label">${tT('evoSection')}</div>
        <div class="pk-evo-tree">${renderChainNode(chain, selectedSpeciesName)}</div>`;
    return true;
}

function renderPkInfo() {
    const resultDiv = document.getElementById('pk-result');
    if (!pkSpeciesData || !resultDiv || resultDiv.style.display === 'none') return;
    renderPkBadge(pkSpeciesData);
    renderPkAbilities(selectedPokemon.abilities);
    renderPkStats(selectedPokemon.stats);
    const infoDiv = document.getElementById('pk-info');
    if (pkChainData && infoDiv) {
        const hasEvo = renderPkEvo(pkChainData.chain, pkCurrentSpeciesName);
        infoDiv.style.display = hasEvo ? 'flex' : 'none';
    }
}

function initAbilityTooltip() {
    if (document.getElementById('ability-tooltip')) return;
    const tip = document.createElement('div');
    tip.id = 'ability-tooltip';
    tip.className = 'ui-tooltip';
    document.body.appendChild(tip);

    function showTip(chip) {
        const slug = chip.dataset.abilitySlug;
        if (!slug) return;
        const desc = pkAbilityNames[slug]?.[`desc_${currentLang}`];
        if (!desc) return;
        tip.textContent = desc;
        const rect = chip.getBoundingClientRect();
        tip.style.top  = (rect.bottom + 6) + 'px';
        tip.style.left = rect.left + 'px';
        tip.classList.add('visible');
        requestAnimationFrame(() => {
            const tr = tip.getBoundingClientRect();
            if (tr.right > window.innerWidth - 8)
                tip.style.left = Math.max(8, window.innerWidth - tr.width - 8) + 'px';
        });
    }

    function hideTip() { tip.classList.remove('visible'); }

    document.addEventListener('mouseover', e => {
        const chip = e.target.closest('#pk-info-abilities .pk-ability-chip');
        if (chip) showTip(chip);
    });
    document.addEventListener('mouseout', e => {
        const chip = e.target.closest('#pk-info-abilities .pk-ability-chip');
        if (chip) hideTip();
    });
    document.addEventListener('click', e => {
        const chip = e.target.closest('#pk-info-abilities .pk-ability-chip');
        if (chip) {
            if (tip.classList.contains('visible') && tip._chip === chip) {
                hideTip();
            } else {
                showTip(chip);
                tip._chip = chip;
            }
        } else {
            hideTip();
            tip._chip = null;
        }
    }, true);
}

function initPkSearch() {
    initAbilityTooltip();
    const input    = document.getElementById('pk-search-input');
    const list     = document.getElementById('pk-search-suggestions');
    const clearBtn = document.getElementById('pk-clear-btn');

    const toggleClear = () => { clearBtn.style.display = input.value ? 'block' : 'none'; };

    clearBtn.addEventListener('click', () => { clearPkSearch(); toggleClear(); });

    input.addEventListener('input', () => { updatePkSuggestions(); toggleClear(); });

    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closePkSuggestions(); return; }
        if (list.style.display !== 'block') return;
        const items  = [...list.querySelectorAll('li')];
        const active = list.querySelector('li.active');
        let idx      = items.indexOf(active);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            idx = idx < items.length - 1 ? idx + 1 : idx;
            items.forEach(li => li.classList.remove('active'));
            if (items[idx]) items[idx].classList.add('active');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            idx = idx > 0 ? idx - 1 : 0;
            items.forEach(li => li.classList.remove('active'));
            if (items[idx]) items[idx].classList.add('active');
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            const target = active ?? items[0];
            if (target) onPkSelect(target.dataset.value);
        }
    });

    list.addEventListener('click', e => {
        const li = e.target.closest('li');
        if (li) onPkSelect(li.dataset.value);
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.pk-ac-wrapper')) closePkSuggestions();
    });
}

function applyTypeLang() {
    document.querySelectorAll('[data-i18n-type]').forEach(el => {
        const key = el.dataset.i18nType;
        const val = TYPE_STRINGS[currentLang][key];
        if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-type-ph]').forEach(el => {
        const key = el.dataset.i18nTypePh;
        const val = TYPE_STRINGS[currentLang][key];
        if (typeof val === 'string') el.placeholder = val;
    });
    renderTypeSelector();
    renderTable();
    renderPkResult();
    renderPkInfo();
}
