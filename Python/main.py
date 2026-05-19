import tkinter as tk
import customtkinter as ctk
import os
import sys
import webbrowser
from importlib.resources import files, as_file
import Code.Constants as constants
import Code.PokemonFrame as PokemonFrame
import Code.IO as IO
import json

from Code.Pokemon import Pokemon

ctk.set_appearance_mode("dark")

def GetAppPath():
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.executable)
    elif __file__:
        application_path = os.path.dirname(__file__)

    return os.path.join(application_path)

root = ctk.CTk()
root.title(constants.appName)
root.configure(fg_color=constants.mainFrameColor)

_btn_font   = ctk.CTkFont(family=constants.fontName, size=constants.smallSize)
_label_font = ctk.CTkFont(family=constants.fontName, size=constants.smallSize)
_link_font  = ctk.CTkFont(family=constants.fontName, size=constants.smallSize, underline=True)

# ── Contenedor principal ──────────────────────────────────────────────────────
mainFrame = ctk.CTkFrame(root, fg_color=constants.mainFrameColor, corner_radius=10,
                         border_width=2, border_color=constants.edgeColor)
mainFrame.pack(fill="both", expand=True, padx=4, pady=4)

# ── Título y avisos ───────────────────────────────────────────────────────────
ctk.CTkLabel(mainFrame, text=constants.appTitle,
             font=ctk.CTkFont(family=constants.fontName, size=constants.largeSize, weight="bold"),
             text_color=constants.fontColor).pack(pady=(10, 2))

ctk.CTkLabel(mainFrame, text=constants.tip1, font=_label_font,
             text_color=constants.fontColor, fg_color="transparent",
             justify="center").pack()

ctk.CTkLabel(mainFrame, text=constants.warning, font=_label_font,
             text_color=constants.errorColor, fg_color="transparent").pack(pady=(0, 8))

# ── Área de Pokémon ───────────────────────────────────────────────────────────
pokemonArea = ctk.CTkFrame(mainFrame, fg_color=constants.innerFrameColor, corner_radius=0)
pokemonArea.pack(fill="x", padx=8, pady=(0, 8))

# ── Settings (layout + opciones) ─────────────────────────────────────────────
settingsFrame = ctk.CTkFrame(mainFrame, fg_color=constants.innerFrameColor, corner_radius=0)
settingsFrame.pack(fill="x", padx=8, pady=(0, 8))

ctk.CTkLabel(settingsFrame, text="Layout",
             font=ctk.CTkFont(family=constants.fontName, size=constants.smallSize, weight="bold"),
             text_color=constants.fontColor, fg_color="transparent").pack(pady=(8, 2))

layouts = [constants.horizontalLayout, constants.verticalLayout]
layout = tk.StringVar(value=constants.horizontalLayout)

def on_layout_change(value):
    layout.set(value)
    IO.UpdateLayoutFile(GetAppPath(), layout)

comboBox = ctk.CTkComboBox(settingsFrame, variable=layout, values=layouts, command=on_layout_change,
                           font=_btn_font, fg_color=constants.entryColor,
                           text_color=constants.fontColor, button_color=constants.buttonsColor,
                           button_hover_color=constants.buttonHoverColor, border_color=constants.edgeColor,
                           dropdown_fg_color=constants.innerFrameColor, dropdown_text_color=constants.fontColor,
                           dropdown_hover_color=constants.buttonHoverColor, width=180)
comboBox.set(layouts[0])
comboBox.pack(pady=(0, 6))

showShadows = tk.BooleanVar(value=True)
showShadowsCheck = ctk.CTkCheckBox(settingsFrame, text=constants.showShadowsProperties,
                                   font=_label_font, text_color=constants.fontColor,
                                   variable=showShadows, fg_color=constants.accentColor,
                                   hover_color=constants.buttonHoverColor,
                                   checkmark_color=constants.mainFrameColor,
                                   border_color=constants.edgeColor)
showShadowsCheck.pack(pady=(0, 4))

def make_callback_showShadows(showShadows):
    def callback(*args):
        IO.UpdateShowShadows(*args, showShadows=showShadows, appDirectory=GetAppPath())
    return callback

showShadows.trace_add("write", make_callback_showShadows(showShadows))

showPokeballBackground = tk.BooleanVar(value=True)
showPokeballBackgroundCheck = ctk.CTkCheckBox(settingsFrame, text=constants.showPokeballBackgroundText,
                                              font=_label_font, text_color=constants.fontColor,
                                              variable=showPokeballBackground, fg_color=constants.accentColor,
                                              hover_color=constants.buttonHoverColor,
                                              checkmark_color=constants.mainFrameColor,
                                              border_color=constants.edgeColor)
showPokeballBackgroundCheck.pack(pady=(0, 8))

def make_callback_showPokeballBackground(showPokeballBackground):
    def callback(*args):
        IO.UpdateShowPokeballBackground(*args, showPokeballBackground=showPokeballBackground,
                                        appDirectory=GetAppPath())
    return callback

showPokeballBackground.trace_add("write", make_callback_showPokeballBackground(showPokeballBackground))

# ── Botones + mensaje de estado ───────────────────────────────────────────────
buttonsFrame = ctk.CTkFrame(mainFrame, fg_color=constants.innerFrameColor, corner_radius=0)
buttonsFrame.pack(fill="x", padx=8, pady=(0, 8))

updateButton = ctk.CTkButton(buttonsFrame, text=constants.updateButtonText, font=_btn_font,
                             fg_color=constants.buttonsColor, hover_color=constants.buttonHoverColor,
                             text_color=constants.fontColor, corner_radius=6,
                             command=lambda: UpdateTeam())
updateButton.pack(fill="x", padx=10, pady=(8, 4))

previewButton = ctk.CTkButton(buttonsFrame, text="Open in browser", font=_btn_font,
                              fg_color=constants.buttonsColor, hover_color=constants.buttonHoverColor,
                              text_color=constants.fontColor, corner_radius=6,
                              command=lambda: OpenHTMLPreview())
previewButton.pack(fill="x", padx=10, pady=(0, 4))

resetButton = ctk.CTkButton(buttonsFrame, text=constants.resetButton, font=_btn_font,
                            fg_color=constants.resetButtonColor, hover_color=constants.resetButtonHoverColor,
                            text_color=constants.fontColor, corner_radius=6,
                            command=lambda: ResetData())
resetButton.pack(fill="x", padx=10, pady=(0, 4))

debugLabel = ctk.CTkLabel(buttonsFrame, text="", font=_label_font,
                          fg_color="transparent", text_color=constants.fontColor)
debugLabel.pack(pady=(0, 6))

# ── Créditos / redes sociales ─────────────────────────────────────────────────
spamFrame = ctk.CTkFrame(mainFrame, fg_color=constants.innerFrameColor, corner_radius=0)
spamFrame.pack(fill="x", padx=8, pady=(0, 8))

ctk.CTkLabel(spamFrame, text=constants.credits,
             font=ctk.CTkFont(family=constants.fontName, size=13),
             fg_color="transparent", text_color=constants.fontColor).pack(pady=(6, 2))

twitchButton   = ctk.CTkButton(spamFrame, text=constants.twitch,    font=_link_font,
                               fg_color="transparent", hover_color=constants.buttonHoverColor,
                               text_color=constants.linkColor, width=80, height=20,
                               command=lambda: OpenURL(constants.twitchAddress))
instagramButton = ctk.CTkButton(spamFrame, text=constants.instagram, font=_link_font,
                                fg_color="transparent", hover_color=constants.buttonHoverColor,
                                text_color=constants.linkColor, width=80, height=20,
                                command=lambda: OpenURL(constants.instagramAddress))
tiktokButton   = ctk.CTkButton(spamFrame, text=constants.tiktok,    font=_link_font,
                               fg_color="transparent", hover_color=constants.buttonHoverColor,
                               text_color=constants.linkColor, width=80, height=20,
                               command=lambda: OpenURL(constants.tiktokAddress))
twitterButton  = ctk.CTkButton(spamFrame, text=constants.x,         font=_link_font,
                               fg_color="transparent", hover_color=constants.buttonHoverColor,
                               text_color=constants.linkColor, width=80, height=20,
                               command=lambda: OpenURL(constants.xAddress))
twitchButton.pack(pady=0)
instagramButton.pack(pady=0)
tiktokButton.pack(pady=0)
twitterButton.pack(pady=(0, 6))

pokemonFrames = [
    PokemonFrame.PokemonFrame(i, pokemonArea)
    for i in range(6)
]

# Carga nombres válidos desde los recursos para el autocompletado
def _load_pokemon_names():
    try:
        sprites_dir = files('Resources') / 'AnimatedSprites'
        names = set()
        for entry in sprites_dir.iterdir():
            n = entry.name
            if n.endswith('.gif') and not n.endswith(' (1).gif') and not n.endswith('-f.gif'):
                name = n[:-4]
                if '-' not in name and '(' not in name:
                    names.add(name)
        return sorted(names)
    except Exception:
        return []

_pokemon_names = _load_pokemon_names()

def _update_suggestions(pf, *_):
    typed = pf.pokemonNameEntry.get().lower()
    matches = [n for n in _pokemon_names if n.startswith(typed)][:8] if len(typed) >= 2 else []
    pf.pokemonNameInput.configure(values=matches)

for _pf in pokemonFrames:
    _pf.pokemonNameEntry.trace_add("write", lambda *a, p=_pf: _update_suggestions(p))
    _pf.pokemonNameInput.bind("<Return>", lambda e: UpdateTeam())
    _pf.pokemonMoteInput.bind("<Return>", lambda e: UpdateTeam())

pokemonList = []

maxPokemon = 6

def Init():
    IO.CreateBaseFolders(GetAppPath())
    IO.CreateJsonFile(GetAppPath(), False)

    GetJsonData()
    FillEntries()

    IO.CreateShadowsFile(GetAppPath(), showShadows)
    IO.GetShowShadows(GetAppPath(), showShadows)

    IO.CreateLayoutFile(GetAppPath(), layout)
    IO.GetLayout(GetAppPath(), layout)

    IO.CreateShowBackgroundFile(GetAppPath(), showPokeballBackground)
    IO.GetShowPokeballBackground(GetAppPath(), showPokeballBackground)

def GetJsonData():
    if os.path.exists(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.jsonFileName):
        with open(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.jsonFileName, 'r') as file:
            pokemonList.clear()
            data = json.load(file)

            counter = 0
            for key in data['pokemon']:
                for p in data['pokemon'][key]:
                    pokemon = Pokemon(
                        name=p['name'],
                        fileName='',
                        mote=p['mote'],
                        frame=pokemonFrames[counter]
                    )
                    pokemon.frame.frameData.name = p['name']
                    pokemon.frame.frameData.mote = p['mote']

                    pokemon.frame.frameData.properties.update(
                        p.get('properties', {})
                    )
                    pokemon.frame._refresh_icons()

                    pokemonList.append(pokemon)
                    counter += 1

def UpdateJsonData():
    if os.path.exists(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.jsonFileName):
        with open(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.jsonFileName, 'r') as file:
            data_to_save = {
                'pokemon': {
                    'pokemon1': [],
                    'pokemon2': [],
                    'pokemon3': [],
                    'pokemon4': [],
                    'pokemon5': [],
                    'pokemon6': []
                }
            }

            keys = list(data_to_save['pokemon'].keys())

            for i, pokemon in enumerate(pokemonList):
                InitialisePokemon(pokemon)

                p_dict = {
                    'name': pokemon.name,
                    'mote': pokemon.mote,
                    'properties': pokemon.frame.frameData.properties
                }

                data_to_save['pokemon'][keys[i]].append(p_dict)

            with open(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.jsonFileName, 'w') as file:
                json.dump(data_to_save, file, indent=4)

def InitialisePokemon(pokemon):
    pokemon.name = pokemon.frame.pokemonNameEntry.get().upper()
    pokemon.mote = pokemon.frame.pokemonMoteEntry.get().upper() if pokemon.frame.pokemonMoteEntry.get() != "" else pokemon.frame.pokemonNameEntry.get().upper()

def UpdateTeam():
    DebugMsg("", constants.fontColor)

    noNamesError = False
    error = False

    emptyNamesCounter = 0
    for pokemon in pokemonFrames:
        if pokemon.pokemonNameEntry.get() == "":
            emptyNamesCounter += 1

    if emptyNamesCounter == maxPokemon:
        noNamesError = True

    IO.CreateJsonFile(GetAppPath(), True)
    RemoveGifFiles()

    UpdateJsonData()

    for pokemon in pokemonList:
        if pokemon.name != "":
            if ProcessPokemon(pokemon) is False:
                error = True
                break

    if error:
        DebugMsg(constants.errorTeam, constants.errorColor)
        return
    else:
        for pokemon in pokemonList:
            pokemon.frame.skipReset = True
            pokemon.frame.pokemonNameEntry.set(pokemon.name.upper())
            pokemon.frame.pokemonMoteEntry.set(pokemon.mote)

        if noNamesError is not True:
            DebugMsg(constants.successfulTeam, constants.correctColor)

    IO.CreateHTML(GetAppPath(), layout, pokemonList, showPokeballBackground)
    IO.CreateJS(GetAppPath(), maxPokemon, pokemonList, showShadows, showPokeballBackground)

def FillEntries():
    for i, pokemon in enumerate(pokemonList):
        pokemon.frame.pokemonNameEntry.set(pokemon.name)
        pokemon.frame.pokemonMoteEntry.set(pokemon.mote)

def ResetData():
    IO.CreateJsonFile(GetAppPath(), True)
    RemoveGifFiles()
    ClearPokemonFrames()
    GetJsonData()
    UpdateTeam()
    DebugMsg(constants.dataReset, constants.correctColor)

def ClearPokemonFrames():
    for pokemon in pokemonList:
        pokemon.frame.Clear()

def CheckForDuplicateNames(list):
    namesToCheck = []
    for name in list:
        if name != "":
            namesToCheck.append(name)

    return len(namesToCheck) != len(set(namesToCheck))

def GetAliasNamesLines():
    global aliasLines
    with open(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.aliasNamesFileName, encoding="utf-8") as f:
        aliasLines = f.readlines()

def ProcessPokemon(pokemon) -> bool:
    result = BuildPath(pokemon.name, pokemon.frame.frameData.properties)
    ref = files('Resources') / result["path"]

    if Exists(ref):
        if pokemon.name != "":
            pokemon.fileName = result["resultName"]

        Copy(ref)

        return True
    else:
        return False

def Copy(ref):
    with as_file(ref) as path:
        gif_data = str(path)
        IO.Copy(gif_data, GetAppPath() + constants.obsFolder + constants.currentTeamFolder)

def BuildPath(pokemonName, properties) -> dict[str, str]:
    path = constants.resource_path
    defaultName = pokemonName.lower()
    fileName = pokemonName.lower()

    shiny = properties.get('shiny')
    skin = properties.get('skin')
    gender = properties.get('gender')

    if shiny == 'True' and HasShiny(defaultName):
        if skin != 'common' and HasShinySkin(defaultName, skin):
            fileName += "-" + skin

        if gender == 'female' and HasFemaleShiny(defaultName):
            fileName += constants.femaleSuffix

        fileName += constants.shinySuffix
        path += constants.shinyFolder
    elif skin != 'common' and HasSkin(defaultName, skin):
        fileName += "-" + skin

        if HasFemaleSkin(defaultName, skin):
            fileName += constants.femaleSuffix
    elif gender == 'female' and HasFemale(defaultName):
        fileName += constants.femaleSuffix

    path += fileName + constants.gifExtension

    return {
        "resultName": fileName,
        "path": path
    }

def HasShiny(name):
    resource_path = (
        constants.animatedSpritesFolder +
        constants.shinyFolder +
        name +
        constants.shinySuffix +
        constants.gifExtension
    )

    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasFemaleShiny(name):
    resource_path = (
        constants.animatedSpritesFolder +
        constants.shinyFolder +
        name +
        constants.femaleSuffix +
        constants.shinySuffix +
        constants.gifExtension
    )

    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasShinySkin(pokemonName, skinName):
    resource_path = (
        constants.animatedSpritesFolder +
        constants.shinyFolder +
        pokemonName + "-" +
        skinName +
        constants.shinySuffix +
        constants.gifExtension
    )

    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasSkin(pokemonName, skinName):
    resource_path = (
        constants.animatedSpritesFolder +
        pokemonName + "-" +
        skinName +
        constants.gifExtension
    )

    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasFemaleSkin(pokemonName, skinName):
    resource_path = (
        constants.animatedSpritesFolder +
        pokemonName +
        skinName +
        constants.femaleSuffix +
        constants.gifExtension
    )

    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasFemale(pokemonName):
    resource_path = (
        constants.animatedSpritesFolder +
        pokemonName +
        constants.femaleSuffix +
        constants.gifExtension
    )

    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def Exists(path) -> bool:
    return os.path.exists(path)

def DebugMsg(msg, color):
    debugLabel.configure(text=msg, text_color=color)

def RemoveGifFiles():
    currentTeamPath = GetAppPath() + constants.obsFolder + constants.currentTeamFolder
    if os.path.exists(currentTeamPath):
        for filename in os.listdir(currentTeamPath):
            if filename.endswith(constants.gifExtension):
                file_path = os.path.join(currentTeamPath, filename)
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error removing file {file_path}: {e}")

def OpenURL(url):
    webbrowser.open(url)

def OpenHTMLPreview():
    import pathlib
    html_path = os.path.abspath(GetAppPath() + constants.obsFolder + constants.teamVisualizerFileName)
    if os.path.exists(html_path):
        webbrowser.open(pathlib.Path(html_path).as_uri())
    else:
        DebugMsg("Generate the team first.", constants.errorColor)

GetAppPath()
Init()

root.update_idletasks()
root.resizable(False, False)
root.mainloop()
