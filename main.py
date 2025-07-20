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
canvas = tk.Canvas(root, height=600, width=750, bg="#E8E2DB")
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
twitchButton = Button(spamFrame, text="Twitch", font=f"{constants.fontName} {constants.smallSize} underline", highlightthickness = 0, bd=0, bg=constants.buttonsColor, fg=constants.linkColor, command=lambda:OpenURL("www.twitch.tv/Adriplodocus"))
twitterButton = Button(spamFrame, text="X", font=f"{constants.fontName} {constants.smallSize} underline", highlightthickness = 0, bd=0, bg=constants.buttonsColor, fg=constants.linkColor, command=lambda:OpenURL("https://twitter.com/Adriplodocus"))
instagramButton = Button(spamFrame, text="Instagram", font=f"{constants.fontName} {constants.smallSize} underline", highlightthickness = 0, bd=0, bg=constants.buttonsColor, fg=constants.linkColor, command=lambda:OpenURL("https://www.instagram.com/adriplodocus/"))
twitchButton.pack()
twitterButton.pack()
instagramButton.pack()

#Debug.
debugLabelText = tk.StringVar()
debugLabel = Label(debugFrame, font=f"{constants.fontName} {constants.smallSize} ", bg=constants.innerFrameColor, textvariable=debugLabelText)
debugLabel.pack(fill=X)

#Pokemon frames
pokemonFrame0 = PokemonFrame.PokemonFrame(0, root, tk.Frame, tk)
pokemonFrame1 = PokemonFrame.PokemonFrame(1, root, tk.Frame, tk)
pokemonFrame2 = PokemonFrame.PokemonFrame(2, root, tk.Frame, tk)
pokemonFrame3 = PokemonFrame.PokemonFrame(3, root, tk.Frame, tk)
pokemonFrame4 = PokemonFrame.PokemonFrame(4, root, tk.Frame, tk)
pokemonFrame5 = PokemonFrame.PokemonFrame(5, root, tk.Frame, tk)

pokemonFrames = [pokemonFrame0, pokemonFrame1, pokemonFrame2, pokemonFrame3, pokemonFrame4, pokemonFrame5]
pokemonList = []

maxPokemon = 6

def Init():
    IO.CreateBaseFolders(GetAppPath())

    GetStoredTeamData()
    FillEntries()
    
    IO.CreateShadowsFile(GetAppPath(), showShadows)
    IO.GetShowShadows(GetAppPath(), showShadows)

    IO.CreateLayoutFile(GetAppPath(), layout)
    IO.GetLayout(GetAppPath(), layout)

    IO.CreateShowBackgroundFile(GetAppPath(), showPokeballBackground)
    IO.GetShowPokeballBackground(GetAppPath(), showPokeballBackground)

def GetStoredTeamData():
    if os.path.exists(GetAppPath() + constants.jsonFolder + constants.jsonFileName):
        with open(GetAppPath() + constants.jsonFolder + constants.jsonFileName, 'r') as file:
            pokemonList.clear()  # Clear the list before loading new data
            data = json.load(file)
        
            for key in data['pokemon']:
                for p in data['pokemon'][key]:
                    pokemon = Pokemon(
                        name=p['name'],
                        mote=p['mote'],
                        mega=p['mega'],
                        shiny=p['shiny']
                    )

                    pokemonList.append(pokemon)

def UpdateStoredTeamData():
    if os.path.exists(GetAppPath() + constants.jsonFolder + constants.jsonFileName):
        with open(GetAppPath() + constants.jsonFolder + constants.jsonFileName, 'r') as file:
            data = json.load(file)

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
        
            for i, frame in enumerate(pokemonFrames):
                p_dict = {
                    'name': frame.pokemonNameEntry.get().upper(),
                    'mote': frame.pokemonMoteEntry.get().upper(),
                    'shiny': frame.shiny.get(),
                    'mega': frame.mega.get()
                }
                data_to_save['pokemon'][keys[i]].append(p_dict)

            # Guardar JSON
            with open(GetAppPath() + constants.jsonFolder + constants.jsonFileName, 'w') as file:
                json.dump(data_to_save, file, indent=4)

def FillEntries():
    for i, pokemon in enumerate(pokemonList):
        pokemonFrames[i].pokemonNameEntry.set(pokemon.name)
        pokemonFrames[i].pokemonMoteEntry.set(pokemon.mote)
        pokemonFrames[i].mega.set(pokemon.mega)
        pokemonFrames[i].shiny.set(pokemon.shiny)

def ClearTextFields():
    counter = 0
    while counter < maxPokemon:
        pokemonFrames[counter].Clear()
        counter+=1

def ResetData():
    RemoveCurrentTeam()
    ClearTextFields()
    UpdateTeam()
    DebugMsg(constants.dataReset, constants.correctColor)

def UpdateTeam():
    debugLabelText.set("")

    RemoveCurrentTeam()
    UpdateStoredTeamData()

    for pokemon in pokemonList:
        if pokemon.name != "":
            ProcessPokemon(pokemon)

    Init()

    IO.CreateHTML(GetAppPath(), layout, pokemonList, showPokeballBackground)
    IO.CreateJS(GetAppPath(), maxPokemon, pokemonList, showShadows, showPokeballBackground)

def CheckForDuplicateNames(list):
    namesToCheck = []
    for name in list:
        if (name != ""):
            namesToCheck.append(name)

    return len(namesToCheck) != len(set(namesToCheck))

def GetAliasNamesLines():
    global aliasLines
    with open(GetAppPath() + constants.obsFolder + constants.txtFolder + constants.aliasNamesFileName, encoding="utf-8") as f:
        aliasLines = f.readlines()

def ProcessPokemon(pokemon):
    resource_path = constants.animatedSpritesFolder
    pokemonName = pokemon.name

    if pokemon.mega:
        if os.path.exists(GetAppPath() + constants.animatedSpritesFolder + constants.megaFolder + pokemonName + constants.megaSuffix + constants.gifExtension):
            resource_path += constants.megaFolder
            pokemonName += constants.megaSuffix

        if pokemon.shiny:
            if os.path.exists(GetAppPath() + constants.animatedSpritesFolder + constants.megaFolder + constants.shinyFolder + pokemonName + constants.shinySuffix + constants.gifExtension):
                resource_path += constants.shinyFolder
                pokemonName += constants.shinySuffix
    else:
        if pokemon.shiny:
            if os.path.exists(GetAppPath() + constants.animatedSpritesFolder + constants.shinyFolder + pokemonName + constants.shinySuffix + constants.gifExtension):
                resource_path += constants.shinyFolder
                pokemonName += constants.shinySuffix
                
    resource_path += pokemonName.lower() + constants.gifExtension

    try:
        # Access the resource using importlib.resources
        ref = files('Resources') / resource_path  # Replace 'my_package' with your actual package name
        with as_file(ref) as path:
            gif_data = str(path)  # This gives you the file path

            # Proceed with copying the resource and renaming the file
            IO.Copy(gif_data, GetAppPath() + constants.obsFolder + constants.currentTeamFolder)

            copiedFile = GetAppPath() + constants.obsFolder + constants.currentTeamFolder + pokemon.name + constants.gifExtension
            os.rename(copiedFile, GetAppPath() + constants.obsFolder + constants.currentTeamFolder + pokemon.mote + constants.gifExtension)
        
        DebugMsg(constants.successfulTeam, constants.correctColor)

    except Exception as e:
        DebugMsg(constants.errorTeam, constants.errorColor)
        print(str(e))  # Optional, to see the error if needed

def DebugMsg(msg, color):
    debugLabel.config(fg=color)
    debugLabelText.set(msg)

def RemoveCurrentTeam():
    if os.path.exists(GetAppPath() + constants.jsonFolder + constants.jsonFileName):
        with open(GetAppPath() + constants.jsonFolder + constants.jsonFileName, 'r') as file:
            data = json.load(file)

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
        
            for i, frame in enumerate(pokemonFrames):
                p_dict = {
                    'name': "",
                    'mote': "",
                    'male': True,
                    'shiny': False,
                    'mega': False
                }
                data_to_save['pokemon'][keys[i]].append(p_dict)

            # Guardar JSON
            with open(GetAppPath() + constants.jsonFolder + constants.jsonFileName, 'w') as file:
                json.dump(data_to_save, file, indent=4)

def OpenURL(url):
    webbrowser.open(url)

GetAppPath()
Init()

root.mainloop()