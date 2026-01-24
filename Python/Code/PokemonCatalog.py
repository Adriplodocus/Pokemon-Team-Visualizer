common_props = {
    'gender': ['male', 'female'],
    'skin': ['common',],
    'shiny': [False, True],
}

default_props= {
    'gender': 'male',
    'skin': 'common',
    'shiny': False,
}

pokemon_properties = {
    'aegislash': {
        'skin': ['blade'],
    },

    'alcremie': {
        'skin': [
            'caramel-swirl-berry','caramel-swirl-clover','caramel-swirl-flower','caramel-swirl-love',
            'caramel-swirl-ribbon','caramel-swirl-star','caramel-swirl-strawberry',
            'lemon-cream-berry','lemon-cream-clover','lemon-cream-flower','lemon-cream-love',
            'lemon-cream-ribbon','lemon-cream-star','lemon-cream-strawberry',
            'matcha-cream-berry','matcha-cream-clover','matcha-cream-flower','matcha-cream-love',
            'matcha-cream-ribbon','matcha-cream-star','matcha-cream-strawberry',
            'mint-cream-berry','mint-cream-clover','mint-cream-flower','mint-cream-love',
            'mint-cream-ribbon','mint-cream-star','mint-cream-strawberry',
            'rainbow-swirl-berry','rainbow-swirl-clover','rainbow-swirl-flower','rainbow-swirl-love',
            'rainbow-swirl-ribbon','rainbow-swirl-star','rainbow-swirl-strawberry',
            'ruby-cream-berry','ruby-cream-clover','ruby-cream-flower','ruby-cream-love',
            'ruby-cream-ribbon','ruby-cream-star','ruby-cream-strawberry',
            'ruby-swirl-berry','ruby-swirl-clover','ruby-swirl-flower','ruby-swirl-love',
            'ruby-swirl-ribbon','ruby-swirl-star','ruby-swirl-strawberry',
            'salted-cream-berry','salted-cream-clover','salted-cream-flower','salted-cream-love',
            'salted-cream-ribbon','salted-cream-star','salted-cream-strawberry',
            'vanilla-cream-berry','vanilla-cream-clover','vanilla-cream-flower',
            'vanilla-cream-love','vanilla-cream-ribbon','vanilla-cream-star'
        ],
    },

    'arceus': {
        'skin': [
            'bug','dark','dragon','electric','fairy','fighting','fire','flying',
            'ghost','grass','ground','ice','poison','psychic','rock','steel','water'
        ],
    },

    'basculin': {
        'skin': ['blue','red'],
    },

    'burmy': {
        'skin': ['sandy','trash'],
    },

    'calyrex': {
        'skin': ['icerider','shadowrider','dada'],
    },

    'castform': {
        'skin': ['rainy','snowy','sunny'],
    },

    'cherrim': {
        'skin': ['sunshine'],
    },

    'cramorant': {
        'skin': ['gorging','gulping'],
    },

    'darmanitan': {
        'skin': ['zen'],
    },

    'deerling': {
        'skin': ['autumn','summer','winter'],
    },

    'deoxys': {
        'skin': ['attack','defense','speed'],
    },

    'dialga': {
        'skin': ['origin'],
    },

    'eiscue': {
        'skin': ['noice'],
    },

    'enamorus': {
        'skin': ['therian'],
    },

    'flabebe': {
        'skin': ['blue','orange','white','yellow'],
    },

    'floette': {
        'skin': ['blue','orange','white','yellow','eternal'],
    },

    'florges': {
        'skin': ['blue','orange','white','yellow'],
    },

    'furfrou': {
        'skin': [
            'dandy','debutante','diamond','heart','kabuki',
            'lareine','matron','pharaoh','star'
        ],
    },

    'gastrodon': {
        'skin': ['east','west'],
    },

    'genesect': {
        'skin': ['burn','chill','douse','shock'],
    },

    'giratina': {
        'skin': ['origin'],
    },

    'greninja': {
        'skin': ['ash'],
    },

    'groudon': {
        'skin': ['primal'],
    },

    'hoopa': {
        'skin': ['unbound'],
    },

    'kyogre': {
        'skin': ['primal'],
    },

    'kyurem': {
        'skin': ['white','blackoverdrive','whiteoverdrive'],
    },

    'landorus': {
        'skin': ['therian'],
    },
    'lycanroc': {
        'skin': ['dusk','midnight'],
    },

    'magearna': {
        'skin': ['original'],
    },

    'meloetta': {
        'skin': ['pirouette'],
    },

    'minior': {
        'skin': ['blue','green','indigo','orange','red','violet','yellow'],
    },

    'morpeko': {
        'skin': ['hangry'],
    },
    'necrozma': {
        'skin': ['dawnwings','duskmane','ultra'],
    },


    'oricorio': {
        'skin': ['sensu'],
    },

    'palafin': {
        'skin': ['hero'],
    },

    'palkia': {
        'skin': ['origin'],
    },

    'pikachu': {
        'skin': [
            'alolacap','belle','cap','cosplay','libre','phd',
            'popstar','rockstar','originalcap','partnercap',
            'hoenncap','sinnoh','unovacap','gorra8'
        ],
    },

    'polteageist': {
        'skin': ['antique','phony'],
    },

    'rotom': {
        'skin': ['fan','frost','heat','mow','wash'],
    },

    'sawsbuck': {
        'skin': ['autumn','summer','winter'],
    },

    'shaymin': {
        'skin': ['sky'],
    },

    'shellos': {
        'skin': ['east','west'],
    },

    'silvally': {
        'skin': [
            'bug','dark','dragon','electric','fairy','fighting','fire','flying',
            'ghost','grass','ground','ice','poison','psychic','rock','steel','water'
        ],
    },

    'squawkabilly': {
        'skin': ['blue','green','white','yellow'],
    },

    'tandemaus': {
        'skin': ['four'],
    },

    'tatsugiri': {
        'skin': ['droopy','stretchy'],
    },

    'thundurus': {
        'skin': ['therian'],
    },

    'tornadus': {
        'skin': ['therian'],
    },

    'toxtricity': {
        'skin': ['lowkey'],
    },

    'unown': {
        'skin': [
            'bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet',
            'kilo','lima','mike','oscar','papa','quebec','romeo','sierra','tango',
            'uniform','victor','whiskey','xray','yankee','zulu','exclamation','question'
        ],
    },

    'ursaluna': {
        'skin': ['bloodmoon'],
    },

    'vivillon': {
        'skin': [
            'archipelago','continental','elegant','fancy','garden',
            'highplains','jungle','marine'
        ],
    },

    #region Region
    'raichu': {
        'skin': ['autumn', 'summer', 'winter'],
    },

    'marowak': {
        'skin': ['alola'],
    },

    'meowth': {
        'skin': ['alola, galar'],
    },

    'persian': {
        'skin': ['alola'],
    },
    
    'sandshrew': {
        'skin': ['alola'],
    },
    
    'sandslash': {
        'skin': ['alola'],
    },
    
    'vulpix': {
        'skin': ['alola'],
    },
    
    'ninetales': {
        'skin': ['alola'],
    },
    
    'exeggcutor': {
        'skin': ['alola'],
    },
    
    'rattata': {
        'skin': ['alola'],
    },
    
    'raticate': {
        'skin': ['alola'],
    },
    
    'grimer': {
        'skin': ['alola'],
    },
    
    'muk': {
        'skin': ['alola'],
    },
    
    'diglett': {
        'skin': ['alola'],
    },
    
    'dugtrio': {
        'skin': ['alola'],
    },

    'growlithe': {
        'skin': ['hisuian'],
    },
    
    'arcanine': {
        'skin': ['hisuian'],
    },

    'voltorb': {
        'skin': ['hisuian'],
    },

    'electrode': {
        'skin': ['hisuian'],
    },

    'typhlosion': {
        'skin': ['hisuian'],
    },

    'qwilfish': {
        'skin': ['hisuian'],
    },

    'sneasel': {
        'skin': ['hisuian'],
    },

    'samurott': {
        'skin': ['hisuian'],
    },

    'lilligant': {
        'skin': ['hisuian'],
    },

    'zorua': {
        'skin': ['hisuian'],
    },

    'zoroark': {
        'skin': ['hisuian'],
    },

    'braviary': {
        'skin': ['hisuian'],
    },

    'sliggoo': {
        'skin': ['hisuian'],
    },

    'goodra': {
        'skin': ['hisuian'],
    },

    'avalugg': {
        'skin': ['hisuian'],
    },

    'decidueye': {
        'skin': ['hisuian'],
    },

    'wooper': {
        'skin': ['paldea'],
    },

    'tauros': {
        'skin': ['paldeacombat','paldeablaze','paldeaaqua'],
    },

    'ponyta': {
        'skin': ['galar'],
    },

    'rapidash': {
        'skin': ['galar'],
    },

    'slowpoke': {
        'skin': ['galar'],
    },

    'slowbro': {
        'skin': ['galar'],
    },

    'farfetchd': {
        'skin': ['galar'],
    },

    'weezing': {
        'skin': ['galar'],
    },

    'mrmime': {
        'skin': ['galar'],
    },

    'articuno': {
        'skin': ['galar'],
    },

    'zapdos': {
        'skin': ['galar'],
    },

    'moltres': {
        'skin': ['galar'],
    },

    'slowking': {
        'skin': ['galar'],
    },

    'corsola': {
        'skin': ['galar'],
    },

    'zigzagoon': {
        'skin': ['galar'],
    },

    'linoone': {
        'skin': ['galar'],
    },

    'darumaka': {
        'skin': ['galar'],
    },

    'darmanitan': {
        'skin': ['zen', 'galarice', 'galaricefire'],
    },

    'yamask': {
        'skin': ['galar'],
    },

    'stunfisk': {
        'skin': ['galar'],
    },
    #endregion
}