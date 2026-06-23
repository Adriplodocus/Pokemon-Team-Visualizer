const TYPES = [
    'normal','fire','water','electric','grass','ice',
    'fighting','poison','ground','flying','psychic','bug',
    'rock','ghost','dragon','dark','steel','fairy'
];

const TYPE_COLORS = {
    normal:   '#A8A878',
    fire:     '#F08030',
    water:    '#6890F0',
    electric: '#F8D030',
    grass:    '#78C850',
    ice:      '#98D8D8',
    fighting: '#C03028',
    poison:   '#A040A0',
    ground:   '#E0C068',
    flying:   '#A890F0',
    psychic:  '#F85888',
    bug:      '#A8B820',
    rock:     '#B8A038',
    ghost:    '#705898',
    dragon:   '#7038F8',
    dark:     '#705848',
    steel:    '#B8B8D0',
    fairy:    '#EE99AC',
};

const TYPE_NAMES = {
    es: {
        normal:'Normal', fire:'Fuego',    water:'Agua',    electric:'Eléctrico',
        grass:'Planta',  ice:'Hielo',     fighting:'Lucha', poison:'Veneno',
        ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
        rock:'Roca',     ghost:'Fantasma', dragon:'Dragón',   dark:'Siniestro',
        steel:'Acero',   fairy:'Hada'
    },
    en: {
        normal:'Normal', fire:'Fire',     water:'Water',   electric:'Electric',
        grass:'Grass',   ice:'Ice',       fighting:'Fighting', poison:'Poison',
        ground:'Ground', flying:'Flying', psychic:'Psychic',   bug:'Bug',
        rock:'Rock',     ghost:'Ghost',   dragon:'Dragon',     dark:'Dark',
        steel:'Steel',   fairy:'Fairy'
    }
};

// TYPE_CHART[defenderType][attackerType] = multiplier (Gen 6+ rules)
const TYPE_CHART = {
    normal:   {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:2,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:1,  ghost:0,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    fire:     {normal:1,   fire:0.5, water:2,   electric:1,  grass:0.5, ice:0.5, fighting:1,  poison:1,   ground:2,  flying:1,  psychic:1,  bug:0.5, rock:2,  ghost:1,  dragon:1,  dark:1,   steel:0.5, fairy:0.5},
    water:    {normal:1,   fire:0.5, water:0.5, electric:2,  grass:2,   ice:0.5, fighting:1,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:0.5, fairy:1  },
    electric: {normal:1,   fire:1,   water:1,   electric:0.5,grass:1,   ice:1,   fighting:1,  poison:1,   ground:2,  flying:0.5,psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:0.5, fairy:1  },
    grass:    {normal:1,   fire:2,   water:0.5, electric:0.5,grass:0.5, ice:2,   fighting:1,  poison:2,   ground:0.5,flying:2,  psychic:1,  bug:2,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    ice:      {normal:1,   fire:2,   water:1,   electric:1,  grass:1,   ice:0.5, fighting:2,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:2,  ghost:1,  dragon:1,  dark:1,   steel:2,   fairy:1  },
    fighting: {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:1,  poison:1,   ground:1,  flying:2,  psychic:2,  bug:0.5, rock:0.5,ghost:1,  dragon:1,  dark:0.5, steel:1,   fairy:2  },
    poison:   {normal:1,   fire:1,   water:1,   electric:1,  grass:0.5, ice:1,   fighting:0.5,poison:0.5, ground:2,  flying:1,  psychic:2,  bug:0.5, rock:1,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:0.5},
    ground:   {normal:1,   fire:1,   water:2,   electric:0,  grass:2,   ice:2,   fighting:1,  poison:0.5, ground:1,  flying:1,  psychic:1,  bug:1,   rock:0.5,ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    flying:   {normal:1,   fire:1,   water:1,   electric:2,  grass:0.5, ice:2,   fighting:0.5,poison:1,   ground:0,  flying:1,  psychic:1,  bug:0.5, rock:2,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    psychic:  {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:0.5,poison:1,   ground:1,  flying:1,  psychic:0.5,bug:2,   rock:1,  ghost:2,  dragon:1,  dark:2,   steel:1,   fairy:1  },
    bug:      {normal:1,   fire:2,   water:1,   electric:1,  grass:0.5, ice:1,   fighting:0.5,poison:1,   ground:0.5,flying:2,  psychic:1,  bug:1,   rock:2,  ghost:1,  dragon:1,  dark:1,   steel:1,   fairy:1  },
    rock:     {normal:0.5, fire:0.5, water:2,   electric:1,  grass:2,   ice:1,   fighting:2,  poison:0.5, ground:2,  flying:0.5,psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:1,  dark:1,   steel:2,   fairy:1  },
    ghost:    {normal:0,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:0,  poison:0.5, ground:1,  flying:1,  psychic:1,  bug:0.5, rock:1,  ghost:2,  dragon:1,  dark:2,   steel:1,   fairy:1  },
    dragon:   {normal:1,   fire:0.5, water:0.5, electric:0.5,grass:0.5, ice:2,   fighting:1,  poison:1,   ground:1,  flying:1,  psychic:1,  bug:1,   rock:1,  ghost:1,  dragon:2,  dark:1,   steel:1,   fairy:2  },
    dark:     {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:2,  poison:1,   ground:1,  flying:1,  psychic:0,  bug:2,   rock:1,  ghost:0.5,dragon:1,  dark:0.5, steel:1,   fairy:2  },
    steel:    {normal:0.5, fire:2,   water:1,   electric:1,  grass:0.5, ice:0.5, fighting:2,  poison:0,   ground:2,  flying:0.5,psychic:0.5,bug:0.5, rock:0.5,ghost:1,  dragon:0.5,dark:1,   steel:0.5, fairy:0.5},
    fairy:    {normal:1,   fire:1,   water:1,   electric:1,  grass:1,   ice:1,   fighting:0.5,poison:2,   ground:1,  flying:1,  psychic:1,  bug:0.5, rock:1,  ghost:1,  dragon:0,  dark:0.5, steel:2,   fairy:1  },
};

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
    }
};

function tT(key) {
    return TYPE_STRINGS[currentLang][key];
}

let selectedTypes   = [];
let pkSearchNames   = [];
let selectedPokemon = { name: '', skin: '', types: [] };
let typeProps       = { skin: '', shiny: 'False', gender: 'male' };
let typeModalProps  = {};
let typeResolveId   = 0;
let SPRITE_VER      = '?v=2';

Promise.all([
    fetch('pokemon-list.json').then(r => r.json()),
    fetch('/api/version').then(r => r.json()).catch(() => ({ v: '2' })),
]).then(([names, ver]) => {
    pkSearchNames = names;
    SPRITE_VER    = '?v=' + ver.v;
});

const TYPE_ICON_COLORS = {};

function sampleIconColor(type) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            TYPE_ICON_COLORS[type] = a > 128
                ? `rgb(${r},${g},${b})`
                : TYPE_COLORS[type];
            resolve();
        };
        img.onerror = () => { TYPE_ICON_COLORS[type] = TYPE_COLORS[type]; resolve(); };
        img.src = `sprites/types/${type}.webp?v=2`;
    });
}

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
    selectedPokemon = { name: '', skin: '', types: [] };
    const input = document.getElementById('pk-search-input');
    if (input) input.value = '';
    closePkSuggestions();
    const propsRow = document.getElementById('pk-props-row');
    if (propsRow) propsRow.style.display = 'none';
    const result = document.getElementById('pk-result');
    if (result) result.style.display = 'none';
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

const PK_SLUG_EXCEPTIONS = {
    // base name fixes
    tapukoko:                   'tapu-koko',
    tapulele:                   'tapu-lele',
    tapubulu:                   'tapu-bulu',
    tapufini:                   'tapu-fini',
    'dudunsparce+threesegment': 'dudunsparce-three-segment',
    'ogerpon+cornerstone':      'ogerpon-cornerstone-mask',
    // calyrex
    'calyrex+icerider':         'calyrex-ice',
    'calyrex+shadowrider':      'calyrex-shadow',
    // darmanitan (base needs -standard suffix in PokéAPI)
    darmanitan:                 'darmanitan-standard',
    'darmanitan+galarice':      'darmanitan-galar-standard',
    'darmanitan+galaricefire':  'darmanitan-galar-zen',
    // eiscue (base is ice-face form, noice is separate)
    eiscue:                     'eiscue-ice',
    'eiscue+noice':             'eiscue-noice',
    // kyurem
    'kyurem+blackoverdrive':    'kyurem-black',
    'kyurem+whiteoverdrive':    'kyurem-white',
    // necrozma
    'necrozma+dawnwings':       'necrozma-dawn',
    'necrozma+duskmane':        'necrozma-dusk',
    // pikachu caps
    'pikachu+alolacap':         'pikachu-alola-cap',
    'pikachu+hoenncap':         'pikachu-hoenn-cap',
    'pikachu+kaloscap':         'pikachu-kalos-cap',
    'pikachu+originalcap':      'pikachu-original-cap',
    'pikachu+sinnohcap':        'pikachu-sinnoh-cap',
    'pikachu+unovacap':         'pikachu-unova-cap',
    'pikachu+rockstar':         'pikachu-rock-star',
    'pikachu+popstar':          'pikachu-pop-star',
    // squawkabilly
    'squawkabilly+blue':        'squawkabilly-blue-plumage',
    'squawkabilly+green':       'squawkabilly-green-plumage',
    'squawkabilly+white':       'squawkabilly-white-plumage',
    'squawkabilly+yellow':      'squawkabilly-yellow-plumage',
    // tauros paldea
    'tauros+paldeacombat':      'tauros-paldea-combat-breed',
    'tauros+paldeablaze':       'tauros-paldea-blaze-breed',
    'tauros+paldeaaqua':        'tauros-paldea-aqua-breed',
    // toxtricity
    'toxtricity+lowkey':        'toxtricity-low-key',
    // ursaluna — bloodmoon works via default slug (ursaluna-bloodmoon)
    // basculin (basculin base→404, need explicit striped slugs)
    'basculin+white':           'basculin-white-striped',
    'basculin+red':             'basculin-red-striped',
    'basculin+blue':            'basculin-blue-striped',
    // toxtricity (base→404, amped is the correct slug)
    toxtricity:                 'toxtricity-amped',
    'toxtricity+amped':         'toxtricity-amped',
    // zygarde
    'zygarde+100':              'zygarde-complete',
    // minior (base→404, meteor form uses red-meteor slug; color cores work via default)
    'minior+meteor':            'minior-red-meteor',
    // morpeko (base→404, full-belly and hangry work via default)
    morpeko:                    'morpeko-full-belly',
    // mimikyu (base→404, skipBase — disguised/busted work via default)

    // base forms that require a form suffix in PokéAPI
    aegislash:                  'aegislash-shield',
    basculegion:                'basculegion-male',
    deoxys:                     'deoxys-normal',
    dudunsparce:                'dudunsparce-two-segment',
    enamorus:                   'enamorus-incarnate',
    frillish:                   'frillish-male',
    giratina:                   'giratina-altered',
    gourgeist:                  'gourgeist-average',
    indeedee:                   'indeedee-male',
    jellicent:                  'jellicent-male',
    keldeo:                     'keldeo-ordinary',
    landorus:                   'landorus-incarnate',
    lycanroc:                   'lycanroc-midday',
    maushold:                   'maushold-family-of-three',
    meowstic:                   'meowstic-male',
    nidoran:                    'nidoran-f',
    oinkologne:                 'oinkologne-male',
    oricorio:                   'oricorio-baile',
    palafin:                    'palafin-zero',
    pumpkaboo:                  'pumpkaboo-average',
    pyroar:                     'pyroar-male',
    shaymin:                    'shaymin-land',
    tatsugiri:                  'tatsugiri-curly',
    thundurus:                  'thundurus-incarnate',
    tornadus:                   'tornadus-incarnate',
    urshifu:                    'urshifu-single-strike',
    wishiwashi:                 'wishiwashi-solo',
    wormadam:                   'wormadam-plant',
    typenull:                   'type-null',

    // Paradox Pokémon — stored as one word in pokemon-list.json, PokéAPI uses hyphens
    greattusk:                  'great-tusk',
    screamtail:                 'scream-tail',
    brutebonnet:                'brute-bonnet',
    fluttermane:                'flutter-mane',
    slitherwing:                'slither-wing',
    sandyshocks:                'sandy-shocks',
    roaringmoon:                'roaring-moon',
    irontreads:                 'iron-treads',
    ironbundle:                 'iron-bundle',
    ironhands:                  'iron-hands',
    ironjugulis:                'iron-jugulis',
    ironmoth:                   'iron-moth',
    ironthorns:                 'iron-thorns',
    ironvaliant:                'iron-valiant',
    gougingfire:                'gouging-fire',
    ragingbolt:                 'raging-bolt',
    ironboulder:                'iron-boulder',
    ironcrown:                  'iron-crown',
    walkingwake:                'walking-wake',
    ironleaves:                 'iron-leaves',

    // Spanish display names → PokéAPI English slugs
    bramaluna:                  'roaring-moon',
    colagrito:                  'scream-tail',
    colmilargo:                 'great-tusk',
    electrofuria:               'raging-bolt',
    ferrocuello:                'iron-jugulis',
    ferrodada:                  'iron-treads',
    ferromole:                  'iron-boulder',
    'ferropúas':                'iron-thorns',
    'ferropaladín':             'iron-valiant',
    ferropalmas:                'iron-hands',
    ferropolilla:               'iron-moth',
    ferrosaco:                  'iron-bundle',
    ferrotesta:                 'iron-crown',
    ferroverdor:                'iron-leaves',
    flamariete:                 'gouging-fire',
    furioseta:                  'brute-bonnet',
    melenaleteo:                'flutter-mane',
    ondulagua:                  'walking-wake',
    pelarena:                   'sandy-shocks',
    reptalada:                  'slither-wing',
};

// PokéAPI uses 'hisui' not 'hisuian' for all hisuian forms
const SKIN_SLUG_MAP = { hisuian: 'hisui' };

function toPokeApiSlug(name, skin) {
    const key = skin ? `${name}+${skin}` : name;
    if (PK_SLUG_EXCEPTIONS[key]) return PK_SLUG_EXCEPTIONS[key];
    const base = name
        .replace(/'/g, '')
        .replace(/\./g, '')
        .replace(/\s+/g, '-')
        .replace(/_/g, '-');
    if (!skin) return base;
    const skinSlug = (SKIN_SLUG_MAP[skin] ?? skin).replace(/\s+/g, '-').replace(/_/g, '-');
    return `${base}-${skinSlug}`;
}

async function resolvePokemonTypes(name, skin) {
    const reqId      = ++typeResolveId;
    const capSkin    = skin;
    const capShiny   = typeProps.shiny;
    const capGender  = typeProps.gender;

    const resultDiv = document.getElementById('pk-result');
    const errorEl   = document.getElementById('pk-error');
    const typesDiv  = document.getElementById('pk-result-types');

    resultDiv.style.display  = 'none';
    errorEl.style.display    = 'none';
    typesDiv.innerHTML       = `<span style="color:var(--text)">${tT('loadingTypes')}</span>`;

    const slug = toPokeApiSlug(name, capSkin);
    let types;
    try {
        let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
        // Cosmetic-only skins don't have their own PokéAPI entry — fall back to base slug
        if (!res.ok && capSkin) {
            res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toPokeApiSlug(name, null)}`);
        }
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        types = data.types
            .map(t => t.type.name)
            .filter(t => TYPES.includes(t))
            .slice(0, 2);
    } catch {
        if (reqId !== typeResolveId) return;
        errorEl.textContent   = tT('unknownPokemon');
        errorEl.style.display = 'block';
        return;
    }

    if (reqId !== typeResolveId) return;

    selectedPokemon.types = types;
    selectedTypes = [...types];
    renderTypeSelector();
    renderTable();

    const catalog  = (typeof POKEMON_CATALOG !== 'undefined') ? POKEMON_CATALOG[name] : null;
    const skins    = catalog?.skin ?? [];
    const skinPart = (capSkin && skins.includes(capSkin)) ? `_${capSkin}` : '';
    let spriteFile;
    if (capShiny === 'True') {
        spriteFile = `sprites/shiny/${name}${skinPart}.gif`;
    } else if (capGender === 'female') {
        spriteFile = `sprites/female/${name}${skinPart}.gif`;
    } else {
        spriteFile = `sprites/${name}${skinPart}.gif`;
    }
    const sprite = document.getElementById('pk-result-sprite');
    sprite.onerror = () => { sprite.onerror = null; sprite.src = `sprites/${name}.gif` + SPRITE_VER; };
    sprite.src = spriteFile + SPRITE_VER;

    renderPkResult();
    resultDiv.style.display = 'flex';
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

function initPkSearch() {
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
}
