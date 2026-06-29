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

// ── Level cap data ────────────────────────────────────────────────
// String values are aliases: resolve with
//   const d = LEVEL_CAPS[k]; const data = typeof d === 'string' ? LEVEL_CAPS[d] : d;
// Absent keys → panel hidden.
const LEVEL_CAPS = {

  // ── Kanto ──────────────────────────────────────────────────────
  'pokemon-rojo': {
    gyms: [
      { label: { es: 'Brock',     en: 'Brock'     }, cap: 14 },
      { label: { es: 'Misty',     en: 'Misty'     }, cap: 21 },
      { label: { es: 'Lt. Surge', en: 'Lt. Surge' }, cap: 24 },
      { label: { es: 'Erika',     en: 'Erika'     }, cap: 29 },
      { label: { es: 'Koga',      en: 'Koga'      }, cap: 43 },
      { label: { es: 'Sabrina',   en: 'Sabrina'   }, cap: 43 },
      { label: { es: 'Blaine',    en: 'Blaine'    }, cap: 47 },
      { label: { es: 'Giovanni',  en: 'Giovanni'  }, cap: 50 },
    ],
    league: [
      { label: { es: 'Lorelei', en: 'Lorelei' }, cap: 56 },
      { label: { es: 'Bruno',   en: 'Bruno'   }, cap: 58 },
      { label: { es: 'Agatha',  en: 'Agatha'  }, cap: 60 },
      { label: { es: 'Lance',   en: 'Lance'   }, cap: 62 },
      { label: { es: 'Blue',    en: 'Blue'    }, cap: 65 },
    ],
  },
  'pokemon-azul': 'pokemon-rojo',

  'pokemon-amarillo': {
    gyms: [
      { label: { es: 'Brock',     en: 'Brock'     }, cap: 12 },
      { label: { es: 'Misty',     en: 'Misty'     }, cap: 21 },
      { label: { es: 'Lt. Surge', en: 'Lt. Surge' }, cap: 28 },
      { label: { es: 'Erika',     en: 'Erika'     }, cap: 32 },
      { label: { es: 'Koga',      en: 'Koga'      }, cap: 50 },
      { label: { es: 'Sabrina',   en: 'Sabrina'   }, cap: 50 },
      { label: { es: 'Blaine',    en: 'Blaine'    }, cap: 54 },
      { label: { es: 'Giovanni',  en: 'Giovanni'  }, cap: 55 },
    ],
    league: [
      { label: { es: 'Lorelei', en: 'Lorelei' }, cap: 56 },
      { label: { es: 'Bruno',   en: 'Bruno'   }, cap: 58 },
      { label: { es: 'Agatha',  en: 'Agatha'  }, cap: 60 },
      { label: { es: 'Lance',   en: 'Lance'   }, cap: 62 },
      { label: { es: 'Blue',    en: 'Blue'    }, cap: 65 },
    ],
  },

  'pokemon-rojo-fuego': {
    gyms: [
      { label: { es: 'Brock',     en: 'Brock'     }, cap: 14 },
      { label: { es: 'Misty',     en: 'Misty'     }, cap: 21 },
      { label: { es: 'Lt. Surge', en: 'Lt. Surge' }, cap: 24 },
      { label: { es: 'Erika',     en: 'Erika'     }, cap: 29 },
      { label: { es: 'Koga',      en: 'Koga'      }, cap: 43 },
      { label: { es: 'Sabrina',   en: 'Sabrina'   }, cap: 43 },
      { label: { es: 'Blaine',    en: 'Blaine'    }, cap: 47 },
      { label: { es: 'Giovanni',  en: 'Giovanni'  }, cap: 50 },
    ],
    league: [
      { label: { es: 'Lorelei', en: 'Lorelei' }, cap: 54 },
      { label: { es: 'Bruno',   en: 'Bruno'   }, cap: 56 },
      { label: { es: 'Agatha',  en: 'Agatha'  }, cap: 58 },
      { label: { es: 'Lance',   en: 'Lance'   }, cap: 60 },
      { label: { es: 'Blue',    en: 'Blue'    }, cap: 63 },
    ],
  },
  'pokemon-verde-hoja': 'pokemon-rojo-fuego',

  'pokemon-lets-go-pikachu': {
    gyms: [
      { label: { es: 'Brock',     en: 'Brock'     }, cap: 12 },
      { label: { es: 'Misty',     en: 'Misty'     }, cap: 19 },
      { label: { es: 'Lt. Surge', en: 'Lt. Surge' }, cap: 26 },
      { label: { es: 'Erika',     en: 'Erika'     }, cap: 34 },
      { label: { es: 'Koga',      en: 'Koga'      }, cap: 44 },
      { label: { es: 'Sabrina',   en: 'Sabrina'   }, cap: 44 },
      { label: { es: 'Blaine',    en: 'Blaine'    }, cap: 48 },
      { label: { es: 'Giovanni',  en: 'Giovanni'  }, cap: 50 },
    ],
    league: [
      { label: { es: 'Lorelei', en: 'Lorelei' }, cap: 52 },
      { label: { es: 'Bruno',   en: 'Bruno'   }, cap: 53 },
      { label: { es: 'Agatha',  en: 'Agatha'  }, cap: 54 },
      { label: { es: 'Lance',   en: 'Lance'   }, cap: 55 },
      { label: { es: 'Trace',   en: 'Trace'   }, cap: 57 },
    ],
  },
  'pokemon-lets-go-eevee': 'pokemon-lets-go-pikachu',
  // pokemon-anil: absent → panel hidden

  // ── Johto ──────────────────────────────────────────────────────
  'pokemon-oro': {
    gyms: [
      { label: { es: 'Falkner', en: 'Falkner' }, cap:  9 },
      { label: { es: 'Bugsy',   en: 'Bugsy'   }, cap: 16 },
      { label: { es: 'Whitney', en: 'Whitney' }, cap: 20 },
      { label: { es: 'Morty',   en: 'Morty'   }, cap: 25 },
      { label: { es: 'Chuck',   en: 'Chuck'   }, cap: 30 },
      { label: { es: 'Jasmine', en: 'Jasmine' }, cap: 35 },
      { label: { es: 'Pryce',   en: 'Pryce'   }, cap: 31 }, // drops from gym 6
      { label: { es: 'Clair',   en: 'Clair'   }, cap: 40 },
    ],
    league: [
      { label: { es: 'Will',              en: 'Will'              }, cap: 42 },
      { label: { es: 'Koga',              en: 'Koga'              }, cap: 44 },
      { label: { es: 'Bruno',             en: 'Bruno'             }, cap: 46 },
      { label: { es: 'Karen',             en: 'Karen'             }, cap: 47 },
      { label: { es: 'Lance',             en: 'Lance'             }, cap: 50 },
      { label: { es: 'Brock (Kanto)',     en: 'Brock (Kanto)'     }, cap: 44 },
      { label: { es: 'Misty (Kanto)',     en: 'Misty (Kanto)'     }, cap: 47 },
      { label: { es: 'Lt. Surge (Kanto)', en: 'Lt. Surge (Kanto)' }, cap: 45 },
      { label: { es: 'Erika (Kanto)',     en: 'Erika (Kanto)'     }, cap: 46 },
      { label: { es: 'Janine (Kanto)',    en: 'Janine (Kanto)'    }, cap: 39 }, // drops from Surge
      { label: { es: 'Sabrina (Kanto)',   en: 'Sabrina (Kanto)'   }, cap: 48 },
      { label: { es: 'Blaine (Kanto)',    en: 'Blaine (Kanto)'    }, cap: 50 },
      { label: { es: 'Giovanni (Kanto)',  en: 'Giovanni (Kanto)'  }, cap: 58 },
      { label: { es: 'Red',              en: 'Red'               }, cap: 81 },
    ],
  },
  'pokemon-plata':  'pokemon-oro',
  'pokemon-cristal': 'pokemon-oro',

  'pokemon-heartgold': {
    gyms: [
      { label: { es: 'Falkner', en: 'Falkner' }, cap: 13 },
      { label: { es: 'Bugsy',   en: 'Bugsy'   }, cap: 17 },
      { label: { es: 'Whitney', en: 'Whitney' }, cap: 19 },
      { label: { es: 'Morty',   en: 'Morty'   }, cap: 25 },
      { label: { es: 'Chuck',   en: 'Chuck'   }, cap: 31 },
      { label: { es: 'Jasmine', en: 'Jasmine' }, cap: 35 },
      { label: { es: 'Pryce',   en: 'Pryce'   }, cap: 34 }, // drops from gym 6
      { label: { es: 'Clair',   en: 'Clair'   }, cap: 41 },
    ],
    league: [
      { label: { es: 'Will',              en: 'Will'              }, cap: 42 },
      { label: { es: 'Koga',              en: 'Koga'              }, cap: 44 },
      { label: { es: 'Bruno',             en: 'Bruno'             }, cap: 46 },
      { label: { es: 'Karen',             en: 'Karen'             }, cap: 47 },
      { label: { es: 'Lance',             en: 'Lance'             }, cap: 50 },
      { label: { es: 'Brock (Kanto)',     en: 'Brock (Kanto)'     }, cap: 54 },
      { label: { es: 'Misty (Kanto)',     en: 'Misty (Kanto)'     }, cap: 54 },
      { label: { es: 'Lt. Surge (Kanto)', en: 'Lt. Surge (Kanto)' }, cap: 53 },
      { label: { es: 'Erika (Kanto)',     en: 'Erika (Kanto)'     }, cap: 56 },
      { label: { es: 'Janine (Kanto)',    en: 'Janine (Kanto)'    }, cap: 50 }, // drops
      { label: { es: 'Sabrina (Kanto)',   en: 'Sabrina (Kanto)'   }, cap: 55 },
      { label: { es: 'Blaine (Kanto)',    en: 'Blaine (Kanto)'    }, cap: 59 },
      { label: { es: 'Giovanni (Kanto)',  en: 'Giovanni (Kanto)'  }, cap: 60 },
      { label: { es: 'Red',              en: 'Red'               }, cap: 88 },
    ],
  },
  'pokemon-soulsilver': 'pokemon-heartgold',

  // ── Hoenn ──────────────────────────────────────────────────────
  'pokemon-rubi': {
    gyms: [
      { label: { es: 'Roxanne',   en: 'Roxanne'   }, cap: 15 },
      { label: { es: 'Brawly',    en: 'Brawly'    }, cap: 18 },
      { label: { es: 'Wattson',   en: 'Wattson'   }, cap: 23 },
      { label: { es: 'Flannery',  en: 'Flannery'  }, cap: 28 },
      { label: { es: 'Norman',    en: 'Norman'    }, cap: 31 },
      { label: { es: 'Winona',    en: 'Winona'    }, cap: 33 },
      { label: { es: 'Tate & Liza', en: 'Tate & Liza' }, cap: 42 },
      { label: { es: 'Wallace',   en: 'Wallace'   }, cap: 43 },
    ],
    league: [
      { label: { es: 'Sidney', en: 'Sidney' }, cap: 49 },
      { label: { es: 'Phoebe', en: 'Phoebe' }, cap: 51 },
      { label: { es: 'Glacia', en: 'Glacia' }, cap: 53 },
      { label: { es: 'Drake',  en: 'Drake'  }, cap: 55 },
      { label: { es: 'Steven', en: 'Steven' }, cap: 58 },
    ],
  },
  'pokemon-zafiro': 'pokemon-rubi',

  'pokemon-esmeralda': {
    gyms: [
      { label: { es: 'Roxanne',   en: 'Roxanne'   }, cap: 15 },
      { label: { es: 'Brawly',    en: 'Brawly'    }, cap: 19 },
      { label: { es: 'Wattson',   en: 'Wattson'   }, cap: 24 },
      { label: { es: 'Flannery',  en: 'Flannery'  }, cap: 29 },
      { label: { es: 'Norman',    en: 'Norman'    }, cap: 31 },
      { label: { es: 'Winona',    en: 'Winona'    }, cap: 33 },
      { label: { es: 'Tate & Liza', en: 'Tate & Liza' }, cap: 42 },
      { label: { es: 'Juan',      en: 'Juan'      }, cap: 46 },
    ],
    league: [
      { label: { es: 'Sidney',  en: 'Sidney'  }, cap: 49 },
      { label: { es: 'Phoebe',  en: 'Phoebe'  }, cap: 51 },
      { label: { es: 'Glacia',  en: 'Glacia'  }, cap: 53 },
      { label: { es: 'Drake',   en: 'Drake'   }, cap: 55 },
      { label: { es: 'Wallace', en: 'Wallace' }, cap: 58 },
    ],
  },

  'pokemon-rubi-omega': {
    gyms: [
      { label: { es: 'Roxanne',   en: 'Roxanne'   }, cap: 14 },
      { label: { es: 'Brawly',    en: 'Brawly'    }, cap: 16 },
      { label: { es: 'Wattson',   en: 'Wattson'   }, cap: 21 },
      { label: { es: 'Flannery',  en: 'Flannery'  }, cap: 28 },
      { label: { es: 'Norman',    en: 'Norman'    }, cap: 30 },
      { label: { es: 'Winona',    en: 'Winona'    }, cap: 35 },
      { label: { es: 'Tate & Liza', en: 'Tate & Liza' }, cap: 45 },
      { label: { es: 'Juan',      en: 'Juan'      }, cap: 46 },
    ],
    league: [
      { label: { es: 'Sidney', en: 'Sidney' }, cap: 52 },
      { label: { es: 'Phoebe', en: 'Phoebe' }, cap: 53 },
      { label: { es: 'Glacia', en: 'Glacia' }, cap: 54 },
      { label: { es: 'Drake',  en: 'Drake'  }, cap: 55 },
      { label: { es: 'Steven', en: 'Steven' }, cap: 59 },
    ],
  },
  'pokemon-zafiro-alfa': 'pokemon-rubi-omega',

  // ── Sinnoh ─────────────────────────────────────────────────────
  'pokemon-diamante': {
    gyms: [
      { label: { es: 'Roark',        en: 'Roark'        }, cap: 14 },
      { label: { es: 'Gardenia',     en: 'Gardenia'     }, cap: 22 },
      { label: { es: 'Maylene',      en: 'Maylene'      }, cap: 30 },
      { label: { es: 'Crasher Wake', en: 'Crasher Wake' }, cap: 30 },
      { label: { es: 'Fantina',      en: 'Fantina'      }, cap: 36 },
      { label: { es: 'Byron',        en: 'Byron'        }, cap: 39 },
      { label: { es: 'Candice',      en: 'Candice'      }, cap: 42 },
      { label: { es: 'Volkner',      en: 'Volkner'      }, cap: 49 },
    ],
    league: [
      { label: { es: 'Aaron',  en: 'Aaron'  }, cap: 57 },
      { label: { es: 'Bertha', en: 'Bertha' }, cap: 59 },
      { label: { es: 'Flint',  en: 'Flint'  }, cap: 61 },
      { label: { es: 'Lucian', en: 'Lucian' }, cap: 63 },
      { label: { es: 'Cynthia', en: 'Cynthia' }, cap: 66 },
    ],
  },
  'pokemon-perla':              'pokemon-diamante',
  'pokemon-diamante-brillante': 'pokemon-diamante',
  'pokemon-perla-reluciente':   'pokemon-diamante',

  'pokemon-platino': {
    gyms: [
      { label: { es: 'Roark',        en: 'Roark'        }, cap: 14 },
      { label: { es: 'Gardenia',     en: 'Gardenia'     }, cap: 22 },
      { label: { es: 'Maylene',      en: 'Maylene'      }, cap: 26 },
      { label: { es: 'Crasher Wake', en: 'Crasher Wake' }, cap: 32 },
      { label: { es: 'Fantina',      en: 'Fantina'      }, cap: 37 },
      { label: { es: 'Byron',        en: 'Byron'        }, cap: 41 },
      { label: { es: 'Candice',      en: 'Candice'      }, cap: 44 },
      { label: { es: 'Volkner',      en: 'Volkner'      }, cap: 50 },
    ],
    league: [
      { label: { es: 'Aaron',  en: 'Aaron'  }, cap: 53 },
      { label: { es: 'Bertha', en: 'Bertha' }, cap: 55 },
      { label: { es: 'Flint',  en: 'Flint'  }, cap: 57 },
      { label: { es: 'Lucian', en: 'Lucian' }, cap: 59 },
      { label: { es: 'Cynthia', en: 'Cynthia' }, cap: 62 },
    ],
  },

  // ── Unova ──────────────────────────────────────────────────────
  'pokemon-negro': {
    gyms: [
      { label: { es: 'Cilan/Chili/Cress', en: 'Cilan/Chili/Cress' }, cap: 14 },
      { label: { es: 'Lenora',  en: 'Lenora'  }, cap: 20 },
      { label: { es: 'Burgh',   en: 'Burgh'   }, cap: 23 },
      { label: { es: 'Elesa',   en: 'Elesa'   }, cap: 27 },
      { label: { es: 'Clay',    en: 'Clay'    }, cap: 31 },
      { label: { es: 'Skyla',   en: 'Skyla'   }, cap: 35 },
      { label: { es: 'Brycen',  en: 'Brycen'  }, cap: 39 },
      { label: { es: 'Iris/Drayden', en: 'Iris/Drayden' }, cap: 43 },
    ],
    league: [
      { label: { es: 'Shauntal', en: 'Shauntal' }, cap: 50 },
      { label: { es: 'Marshal',  en: 'Marshal'  }, cap: 50 },
      { label: { es: 'Grimsley', en: 'Grimsley' }, cap: 50 },
      { label: { es: 'Caitlin',  en: 'Caitlin'  }, cap: 50 },
      { label: { es: 'N',        en: 'N'        }, cap: 52 },
      { label: { es: 'Ghetsis',  en: 'Ghetsis'  }, cap: 54 },
    ],
  },
  'pokemon-blanco': 'pokemon-negro',

  'pokemon-negro-2': {
    gyms: [
      { label: { es: 'Cheren',  en: 'Cheren'  }, cap: 13 },
      { label: { es: 'Roxie',   en: 'Roxie'   }, cap: 18 },
      { label: { es: 'Burgh',   en: 'Burgh'   }, cap: 24 },
      { label: { es: 'Elesa',   en: 'Elesa'   }, cap: 30 },
      { label: { es: 'Clay',    en: 'Clay'    }, cap: 33 },
      { label: { es: 'Skyla',   en: 'Skyla'   }, cap: 39 },
      { label: { es: 'Drayden', en: 'Drayden' }, cap: 48 },
      { label: { es: 'Marlon',  en: 'Marlon'  }, cap: 51 },
    ],
    league: [
      { label: { es: 'Shauntal', en: 'Shauntal' }, cap: 58 },
      { label: { es: 'Marshal',  en: 'Marshal'  }, cap: 58 },
      { label: { es: 'Grimsley', en: 'Grimsley' }, cap: 58 },
      { label: { es: 'Caitlin',  en: 'Caitlin'  }, cap: 58 },
      { label: { es: 'Iris',     en: 'Iris'     }, cap: 59 },
    ],
  },
  'pokemon-blanco-2': 'pokemon-negro-2',

  // ── Kalos ──────────────────────────────────────────────────────
  'pokemon-x': {
    gyms: [
      { label: { es: 'Viola',   en: 'Viola'   }, cap: 12 },
      { label: { es: 'Grant',   en: 'Grant'   }, cap: 25 },
      { label: { es: 'Korrina', en: 'Korrina' }, cap: 32 },
      { label: { es: 'Ramos',   en: 'Ramos'   }, cap: 34 },
      { label: { es: 'Clemont', en: 'Clemont' }, cap: 37 },
      { label: { es: 'Valerie', en: 'Valerie' }, cap: 42 },
      { label: { es: 'Olympia', en: 'Olympia' }, cap: 48 },
      { label: { es: 'Wulfric', en: 'Wulfric' }, cap: 59 },
    ],
    league: [
      { label: { es: 'Malva',    en: 'Malva'    }, cap: 65 },
      { label: { es: 'Siebold',  en: 'Siebold'  }, cap: 65 },
      { label: { es: 'Wikstrom', en: 'Wikstrom' }, cap: 65 },
      { label: { es: 'Drasna',   en: 'Drasna'   }, cap: 65 },
      { label: { es: 'Diantha',  en: 'Diantha'  }, cap: 68 },
    ],
  },
  'pokemon-y': 'pokemon-x',

  // ── Alola ──────────────────────────────────────────────────────
  // Sol/Luna: 11 stamps (matches REGION_DATA Alola count:11)
  'pokemon-sol': {
    gyms: [
      { label: { es: 'Ilima',            en: 'Ilima'            }, cap: 12 },
      { label: { es: 'Hala',             en: 'Hala'             }, cap: 15 },
      { label: { es: 'Lana',             en: 'Lana'             }, cap: 20 },
      { label: { es: 'Kiawe',            en: 'Kiawe'            }, cap: 22 },
      { label: { es: 'Mallow',           en: 'Mallow'           }, cap: 24 },
      { label: { es: 'Olivia',           en: 'Olivia'           }, cap: 26 },
      { label: { es: 'Sophocles',        en: 'Sophocles'        }, cap: 29 },
      { label: { es: 'Acerola',          en: 'Acerola'          }, cap: 33 },
      { label: { es: 'Nanu',             en: 'Nanu'             }, cap: 39 },
      { label: { es: 'Vast Poni Canyon', en: 'Vast Poni Canyon' }, cap: 45 },
      { label: { es: 'Hapu',             en: 'Hapu'             }, cap: 48 },
    ],
    league: [
      { label: { es: 'Hala',   en: 'Hala'   }, cap: 55 },
      { label: { es: 'Olivia', en: 'Olivia' }, cap: 55 },
      { label: { es: 'Acerola', en: 'Acerola' }, cap: 55 },
      { label: { es: 'Kahili', en: 'Kahili' }, cap: 55 },
      { label: { es: 'Kukui',  en: 'Kukui'  }, cap: 58 },
    ],
  },
  'pokemon-luna': 'pokemon-sol',

  // UltraSol/UltraLuna: 12 stamps (matches REGION_DATA AlolaUltra count:12)
  'pokemon-ultrasol': {
    gyms: [
      { label: { es: 'Ilima',            en: 'Ilima'            }, cap: 12 },
      { label: { es: 'Hala',             en: 'Hala'             }, cap: 16 },
      { label: { es: 'Lana',             en: 'Lana'             }, cap: 20 },
      { label: { es: 'Kiawe',            en: 'Kiawe'            }, cap: 22 },
      { label: { es: 'Mallow',           en: 'Mallow'           }, cap: 24 },
      { label: { es: 'Olivia',           en: 'Olivia'           }, cap: 28 },
      { label: { es: 'Sophocles',        en: 'Sophocles'        }, cap: 33 },
      { label: { es: 'Acerola',          en: 'Acerola'          }, cap: 35 },
      { label: { es: 'Nanu',             en: 'Nanu'             }, cap: 44 },
      { label: { es: 'Vast Poni Canyon', en: 'Vast Poni Canyon' }, cap: 49 },
      { label: { es: 'Mina',             en: 'Mina'             }, cap: 55 },
      { label: { es: 'Hapu',             en: 'Hapu'             }, cap: 54 }, // drops from Mina
    ],
    league: [
      { label: { es: 'Hala',   en: 'Hala'   }, cap: 57 },
      { label: { es: 'Olivia', en: 'Olivia' }, cap: 57 },
      { label: { es: 'Acerola', en: 'Acerola' }, cap: 57 },
      { label: { es: 'Kahili', en: 'Kahili' }, cap: 57 },
      { label: { es: 'Kukui',  en: 'Kukui'  }, cap: 60 },
    ],
  },
  'pokemon-ultraluna': 'pokemon-ultrasol',

  // ── Galar ──────────────────────────────────────────────────────
  // Galar count:10. Slots 1-8 = gym leaders. Slots 9-10 = Championship Cup
  // quarter-finals (Marnie, Hop). League = semi-final/final + champion.
  'pokemon-espada': {
    gyms: [
      { label: { es: 'Milo',   en: 'Milo'   }, cap: 20 },
      { label: { es: 'Nessa',  en: 'Nessa'  }, cap: 24 },
      { label: { es: 'Kabu',   en: 'Kabu'   }, cap: 27 },
      { label: { es: 'Bea',    en: 'Bea'    }, cap: 36 }, // Sword exclusive
      { label: { es: 'Opal',   en: 'Opal'   }, cap: 38 },
      { label: { es: 'Gordie', en: 'Gordie' }, cap: 42 }, // Sword exclusive
      { label: { es: 'Piers',  en: 'Piers'  }, cap: 46 },
      { label: { es: 'Raihan', en: 'Raihan' }, cap: 48 },
      { label: { es: 'Marnie', en: 'Marnie' }, cap: 49 }, // Championship Cup QF
      { label: { es: 'Hop',    en: 'Hop'    }, cap: 49 }, // Championship Cup QF
    ],
    league: [
      { label: { es: 'Bede',         en: 'Bede'         }, cap: 53 },
      { label: { es: 'Nessa',        en: 'Nessa'        }, cap: 53 },
      { label: { es: 'Bea/Allister', en: 'Bea/Allister' }, cap: 54 },
      { label: { es: 'Raihan',       en: 'Raihan'       }, cap: 55 },
      { label: { es: 'Leon',         en: 'Leon'         }, cap: 65 },
    ],
  },
  'pokemon-escudo': {
    gyms: [
      { label: { es: 'Milo',     en: 'Milo'     }, cap: 20 },
      { label: { es: 'Nessa',    en: 'Nessa'    }, cap: 24 },
      { label: { es: 'Kabu',     en: 'Kabu'     }, cap: 27 },
      { label: { es: 'Allister', en: 'Allister' }, cap: 36 }, // Shield exclusive
      { label: { es: 'Opal',     en: 'Opal'     }, cap: 38 },
      { label: { es: 'Melony',   en: 'Melony'   }, cap: 42 }, // Shield exclusive
      { label: { es: 'Piers',    en: 'Piers'    }, cap: 46 },
      { label: { es: 'Raihan',   en: 'Raihan'   }, cap: 48 },
      { label: { es: 'Marnie',   en: 'Marnie'   }, cap: 49 },
      { label: { es: 'Hop',      en: 'Hop'      }, cap: 49 },
    ],
    league: [
      { label: { es: 'Bede',         en: 'Bede'         }, cap: 53 },
      { label: { es: 'Nessa',        en: 'Nessa'        }, cap: 53 },
      { label: { es: 'Bea/Allister', en: 'Bea/Allister' }, cap: 54 },
      { label: { es: 'Raihan',       en: 'Raihan'       }, cap: 55 },
      { label: { es: 'Leon',         en: 'Leon'         }, cap: 65 },
    ],
  },

  // ── Paldea ─────────────────────────────────────────────────────
  // Paldea count:8 = Victory Road gyms only.
  'pokemon-escarlata': {
    gyms: [
      { label: { es: 'Katy (Bicho)',   en: 'Katy (Bug)'      }, cap: 15 },
      { label: { es: 'Brassius (Planta)', en: 'Brassius (Grass)' }, cap: 17 },
      { label: { es: 'Iono (Eléctrico)', en: 'Iono (Electric)'  }, cap: 24 },
      { label: { es: 'Kofu (Agua)',    en: 'Kofu (Water)'    }, cap: 30 },
      { label: { es: 'Larry (Normal)', en: 'Larry (Normal)'  }, cap: 36 },
      { label: { es: 'Ryme (Fantasma)', en: 'Ryme (Ghost)'   }, cap: 42 },
      { label: { es: 'Tulip (Psíquico)', en: 'Tulip (Psychic)'}, cap: 45 },
      { label: { es: 'Grusha (Hielo)', en: 'Grusha (Ice)'    }, cap: 48 },
    ],
    league: [
      { label: { es: 'Top Champion',  en: 'Top Champion'  }, cap: 61 },
      { label: { es: 'Geeta',         en: 'Geeta'         }, cap: 62 },
      { label: { es: 'Nemona',        en: 'Nemona'        }, cap: 66 },
    ],
  },
  'pokemon-purpura': 'pokemon-escarlata',

  // ── Fan games ──────────────────────────────────────────────────
  'pokemon-consonancia': {
    info: {
      es: 'Sin level cap fijo. Los rivales se adaptan al nivel de tu equipo.',
      en: "No fixed level cap. Opponents scale to your team's level.",
    },
  },
  // pokemon-anil: absent → panel hidden
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
        levelCapGyms:        'Gimnasios',
        levelCapLeague:      'Liga',
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
        levelCapGyms:        'Gyms',
        levelCapLeague:      'League',
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
    buildLevelCapPanel();
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
            buildLevelCapPanel();
        });

        item.appendChild(img);
        item.appendChild(cb);
        container.appendChild(item);
    }
    buildLevelCapPanel();
}

// ── Level cap panel ──────────────────────────────────────────────
function buildLevelCapPanel() {
    const panel = document.getElementById('level-cap-panel');
    if (!panel) return;

    // Resolve alias
    let entry = LEVEL_CAPS[badgeGame];
    if (typeof entry === 'string') entry = LEVEL_CAPS[entry];

    // No data → hide panel
    if (!entry) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = '';

    // Info-only game (Consonancia)
    if (entry.info) {
        panel.innerHTML = `<p class="cap-info">${entry.info[currentLang]}</p>`;
        return;
    }

    // Active gym index: first unchecked badge
    const nextIdx = badgeActive.indexOf(false);

    const gymRows = entry.gyms.map((g, i) => {
        const cls = i < nextIdx || nextIdx === -1 ? 'cap-done'
                  : i === nextIdx                  ? 'cap-active'
                  : '';
        return `<div class="cap-row ${cls}">
            <span class="cap-name">${g.label[currentLang]}</span>
            <span class="cap-level">Lv.${g.cap}</span>
        </div>`;
    }).join('');

    const leagueRows = entry.league.map((l, i) => {
        const cls = nextIdx === -1 && i === 0 ? 'cap-active' : '';
        return `<div class="cap-row ${cls}">
            <span class="cap-name">${l.label[currentLang]}</span>
            <span class="cap-level">Lv.${l.cap}</span>
        </div>`;
    }).join('');

    panel.innerHTML =
        `<div class="cap-section-title">${tB('levelCapGyms')}</div>` +
        gymRows +
        `<hr class="cap-divider">` +
        `<div class="cap-section-title">${tB('levelCapLeague')}</div>` +
        leagueRows;
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
            if (!badgeExternalMode) {
                fetch('/api/state', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(buildBadgesBlob()),
                }).catch(() => {});
            }
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
            const badgeServerData = serverState.badgeState || serverState.badges;
            if (badgeServerData) {
                applyBadgesServerState(badgeServerData);
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
    if (!hadServerState) hydrateFromAbly();
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
