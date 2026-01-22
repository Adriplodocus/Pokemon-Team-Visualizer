from tkinter import *
import tkinter as tk
from tkinter import ttk
import os
import sys
import webbrowser
import os
from importlib.resources import files, as_file
import Code.Constants as constants
import Code.PokemonFrame as PokemonFrame
import Code.IO as IO
import json

from Code.Pokemon import Pokemon

def GetAppPath():
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.executable)
    elif __file__:
        application_path = os.path.dirname(__file__)

    return os.path.join(application_path)

#UI
root = Tk()
root.resizable(0,0) #The window size won't be modified.
root.title(constants.appName)

#This canvas will contain all app elements.
canvas = tk.Canvas(root, height=600, width=720, bg="#E8E2DB")
canvas.pack()

#Frames
mainFrame = tk.Frame(root, bg=constants.mainFrameColor,highlightbackground=constants.edgeColor,highlightthickness=3)
settingsFrame = tk.Frame(mainFrame, bg=constants.innerFrameColor)
buttonsFrame = tk.Frame(mainFrame, bg=constants.innerFrameColor)
spamFrame = tk.Frame(mainFrame, bg=constants.innerFrameColor)
debugFrame = tk.Frame(mainFrame, bg=constants.innerFrameColor)
mainFrame.place(relwidth=0.985, relheight=0.985, relx=0.5, anchor=N)
settingsFrame.place(relwidth=0.985, height=85, relx=0.5, rely=0.475, anchor=N)
buttonsFrame.place(relwidth=0.985, height=60, relx=0.5, rely=0.635, anchor=N)
spamFrame.place(relwidth=0.985, height=85, relx=0.5, rely=0.85, anchor=N)
debugFrame.place(relwidth=0.985, height=35, relx=0.5, y=constants.baseYForFrames * 12.5, anchor=N)

titleLabel = Label(mainFrame, text=constants.appTitle, font=f"{constants.fontName} {constants.largeSize} bold", bg=constants.mainFrameColor, fg=constants.fontColor)
titleLabel.pack()

#Layout area
layoutLabel = Label(settingsFrame, text="Layout", font=f"{constants.fontName} {constants.smallSize} bold", bg=constants.mainFrameColor, fg=constants.fontColor)
layoutLabel.pack()

layouts = [constants.horizontalLayout, constants.verticalLayout]
layout = StringVar(value=constants.horizontalLayout)  # Default value
comboBox = ttk.Combobox(settingsFrame, textvariable=layout, state="readonly", values=layouts, font=f"{constants.fontName} {constants.smallSize}")
comboBox.current(0)
comboBox.pack()

comboBox.bind("<<ComboboxSelected>>", lambda event: IO.UpdateLayoutFile(GetAppPath(), layout))

showShadows = tk.BooleanVar(value=True)
showShadowsCheck = tk.Checkbutton(settingsFrame, text="Show shadows", font=f"{constants.fontName} {constants.smallSize}", bg=constants.mainFrameColor, fg=constants.fontColor, activebackground=constants.mainFrameColor, selectcolor=constants.mainFrameColor, activeforeground=constants.fontColor, variable=showShadows)
showShadowsCheck.place(relx=0.5, rely=0.60, anchor="n")
showShadowsCheck.pack()

def make_callback_showShadows(showShadows):
    def callback(*args):
        appDirectory = GetAppPath()
        IO.UpdateShowShadows(*args, showShadows=showShadows, appDirectory=appDirectory)
    return callback

showShadows.trace_add("write", make_callback_showShadows(showShadows))

showPokeballBackground = tk.BooleanVar(value=True)
showPokeballBackgroundCheck = tk.Checkbutton(settingsFrame, text="Show pokeball background", font=f"{constants.fontName} {constants.smallSize}", bg=constants.mainFrameColor, fg=constants.fontColor, activebackground=constants.mainFrameColor, selectcolor=constants.mainFrameColor, activeforeground=constants.fontColor, variable=showPokeballBackground)
showPokeballBackgroundCheck.place(relx=0.5, rely=0.60, anchor="n")
showPokeballBackgroundCheck.pack()

def make_callback_showPokeballBackground(showPokeballBackground):
    def callback(*args):
        appDirectory = GetAppPath()
        IO.UpdateShowPokeballBackground(*args, showPokeballBackground=showPokeballBackground, appDirectory=appDirectory)
    return callback

showPokeballBackground.trace_add("write", make_callback_showPokeballBackground(showPokeballBackground))

#Buttons
updateFrame = tk.Frame(buttonsFrame, bg=constants.innerFrameColor)
updateFrame.place(relwidth=0.95, height=35, relx=0.5, rely=0, anchor="n")
updateButton = Button(updateFrame, text=constants.updateButtonText, font=f"{constants.fontName} {constants.smallSize} ", bg=constants.buttonsColor, fg=constants.fontColor, activebackground=constants.buttonsColor, command=lambda:UpdateTeam())
updateButton.pack(fill=X)

resetFrame = tk.Frame(buttonsFrame, bg=constants.innerFrameColor)
resetFrame.place(relwidth=0.95, height=35, relx=0.5, rely=0.5, anchor="n")
resetButton = Button(resetFrame, text=constants.resetButton, font=f"{constants.fontName} {constants.smallSize} ", bg=constants.buttonsColor, fg=constants.fontColor, activebackground=constants.buttonsColor, command=lambda:ResetData())
resetButton.pack(fill=X)

#Spam
spamLabel = Label(spamFrame, text=constants.credits, font=f"{constants.fontName} 12 ", bg=constants.innerFrameColor, fg=constants.fontColor)
spamLabel.pack(fill=X)
twitchButton = Button(spamFrame, text="Twitch", font=f"{constants.fontName} {constants.smallSize} underline", highlightthickness = 0, bd=0, bg=constants.buttonsColor, fg=constants.linkColor, command=lambda:OpenURL("www.twitch.tv/MrKlypp"))
twitterButton = Button(spamFrame, text="X", font=f"{constants.fontName} {constants.smallSize} underline", highlightthickness = 0, bd=0, bg=constants.buttonsColor, fg=constants.linkColor, command=lambda:OpenURL("https://x.com/MrKlypp"))
instagramButton = Button(spamFrame, text="Instagram", font=f"{constants.fontName} {constants.smallSize} underline", highlightthickness = 0, bd=0, bg=constants.buttonsColor, fg=constants.linkColor, command=lambda:OpenURL("https://www.instagram.com/MrKlypp_/"))
twitchButton.pack()
twitterButton.pack()
instagramButton.pack()

#Debug.
debugLabelText = tk.StringVar()
debugLabel = Label(debugFrame, font=f"{constants.fontName} {constants.smallSize} ", bg=constants.innerFrameColor, textvariable=debugLabelText)
debugLabel.pack(fill=X)

#Pokemon frames
pokemonFrames = [
    PokemonFrame.PokemonFrame(i, root, tk.Frame, tk)
    for i in range(6)
]

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
                        mote=p['mote'],
                        frame=pokemonFrames[counter]
                    )
                    pokemon.frame.frameData.name = p['name']
                    pokemon.frame.frameData.mote = p['mote']
                    
                    pokemon.frame.frameData.properties.update(
                        p.get('properties', {})
                    )

                    pokemonList.append(pokemon)
                    counter += 1

def UpdateJsonData():
    if os.path.exists(GetAppPath() + constants.obsFolder +  constants.txtFolder + constants.jsonFileName):
        with open(GetAppPath() + constants.obsFolder +  constants.txtFolder + constants.jsonFileName, 'r') as file:
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

            # Guardar JSON
            with open(GetAppPath() + constants.obsFolder +  constants.txtFolder + constants.jsonFileName, 'w') as file:
                json.dump(data_to_save, file, indent=4)

def InitialisePokemon(pokemon):
    pokemon.name = pokemon.frame.pokemonNameEntry.get().upper()
    pokemon.mote = pokemon.frame.pokemonMoteEntry.get().upper() if pokemon.frame.pokemonMoteEntry.get() != "" else pokemon.frame.pokemonNameEntry.get().upper()

def UpdateTeam():
    debugLabelText.set("")

    IO.CreateJsonFile(GetAppPath(), True)
    RemoveGifFiles()

    UpdateJsonData()

    for pokemon in pokemonList:
        if pokemon.name != "":
            ProcessPokemon(pokemon)

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
        if (name != ""):
            namesToCheck.append(name)

    return len(namesToCheck) != len(set(namesToCheck))

def HasShiny(name):
    resource_path = (
        constants.animatedSpritesFolder +
        constants.shinyFolder +
        name +
        constants.gifExtension
    )
    
    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasMegaEvo(pokemon):
    pokemonName = pokemon.name.lower()
    resource_path = (
        constants.animatedSpritesFolder +
        constants.megaFolder +
        pokemonName +
        constants.megaSuffix +
        constants.gifExtension
    )
    
    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def HasMegaShiny(pokemon):
    pokemonName = pokemon.name.lower()
    resource_path = (
        constants.animatedSpritesFolder +
        constants.megaFolder +
        constants.shinyFolder +
        pokemonName +
        constants.megaSuffix +
        constants.shinySuffix +
        constants.gifExtension
    )
    
    try:
        ref = files('Resources') / resource_path
        return ref.is_file()
    except:
        return False

def GetAliasNamesLines():
    global aliasLines
    with open(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.aliasNamesFileName, encoding="utf-8") as f:
        aliasLines = f.readlines()

def ProcessPokemon(pokemon):
    result = BuildPath(pokemon.name, pokemon.frame.frameData.properties)
    ref = files('Resources') / result["path"]

    if (Exists(ref)):
        Copy(ref, result["resultName"] , pokemon.mote)
        DebugMsg(constants.successfulTeam, constants.correctColor)
    else:
        DebugMsg(constants.errorTeam, constants.errorColor)

def Copy(ref, fileName, mote):
    with as_file(ref) as path:
        gif_data = str(path)

        IO.Copy(gif_data, GetAppPath() + constants.obsFolder + constants.currentTeamFolder)

        copiedFile = GetAppPath() + constants.obsFolder + constants.currentTeamFolder + fileName + constants.gifExtension
        os.rename(copiedFile, GetAppPath() + constants.obsFolder + constants.currentTeamFolder + mote + constants.gifExtension)

def BuildPath(pokemonName, properties) -> dict[str, str]:
    path = constants.resource_path 
    fileName = pokemonName.lower()

    skin = properties.get('skin')
    gender = properties.get('gender')
    shiny = properties.get('shiny')

    if gender == 'female' and skin == "common":
        fileName += constants.femaleSuffix

    if skin == 'common' :
        if shiny == 'True' and HasShiny(fileName + constants.shinySuffix):
            fileName += constants.shinySuffix
            path += constants.shinyFolder
    else:
        fileName += "-" + skin

    path += fileName + constants.gifExtension

    return {
        "resultName": fileName,
        "path": path
    }

def Exists(path) -> bool:
    return os.path.exists(path)

def DebugMsg(msg, color):
    debugLabel.config(fg=color)
    debugLabelText.set(msg)

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

GetAppPath()
Init()

root.mainloop()