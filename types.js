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
        noTypeSelected: 'Selecciona uno o dos tipos para ver la efectividad.',
        resetBtn:       'Resetear',
    },
    en: {
        noTypeSelected: 'Select one or two types to see effectiveness.',
        resetBtn:       'Reset',
    }
};

function tT(key) {
    return TYPE_STRINGS[currentLang][key];
}

let selectedTypes = [];

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
        btn.textContent = TYPE_NAMES[currentLang][type];
        btn.style.background = TYPE_COLORS[type];
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
                `<span class="type-chip" style="background:${TYPE_COLORS[t]}"><img src="sprites/types/${t}.png" alt="" class="type-icon">${TYPE_NAMES[currentLang][t]}</span>`
            ).join('')}</div>
        </div>`;
    }
    container.innerHTML = html;
}

function resetTypes() {
    selectedTypes = [];
    renderTypeSelector();
    renderTable();
}

function applyTypeLang() {
    document.querySelectorAll('[data-i18n-type]').forEach(el => {
        const key = el.dataset.i18nType;
        const val = TYPE_STRINGS[currentLang][key];
        if (typeof val === 'string') el.textContent = val;
    });
    renderTypeSelector();
    renderTable();
}
