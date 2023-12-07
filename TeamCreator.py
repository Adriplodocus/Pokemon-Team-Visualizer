from pickle import APPEND
from tkinter import *
import tkinter as tk
import shutil;
import os
import sys
import webbrowser

#Créditos del desarrollador.
credits = "Made by Adriplodocus."

#Colors
mainFrameColor = "#333333"
edgeColor = "#706C61"
innerFrameColor ="#333333"
buttonsColor = "#333333"
fontColor = "#E6E6E6"
linkColor = "#ff8af9"
errorColor = "#ff6161"
correctColor = "#7aff9e"

#Font properties
fontName = "Fixedsys"
smallSize = 12
mediumSize = 15
largeSize = 20

#Values
appName = "Pokémon team visualizer by @Adriplodocus"
appTitle = "Pokémon team visualizer"

#UI
root = Tk()
root.resizable(0,0) #Evitamos que el tamaño de la ventana se pueda cambiar.
root.title(appName)

#Creamos un canvas que contendrá todos los elementos de la app.
canvas = tk.Canvas(root, height=450, width=600, bg="#E8E2DB")
#Pack para mostrar el canvas.
canvas.pack()

#Creamos un mainFrame que contendrá algunos elementos de la interfaz.
mainFrame = tk.Frame(root, bg=mainFrameColor,highlightbackground=edgeColor,highlightthickness=3)
#Lo situamos con place.
mainFrame.place(relwidth=0.985, relheight=0.985, relx=0.5, anchor=N)

#Label para mostrar el título de la app.
titleLabel = Label(mainFrame, text=appTitle, font=f"{fontName} {largeSize} bold", bg=mainFrameColor, fg=fontColor)
titleLabel.pack()

# Variables para tamaños de elementos de UI
entryWidth = 20
baseYForFrames = 35

#Pokemon base class.
class PokemonFrame:
    def __init__(self, count):
        self.frame = tk.Frame(mainFrame, bg=innerFrameColor)
        self.frame.place(relwidth=0.95, height=50, relx=0.5, y=baseYForFrames * count, anchor="n")

        self.label = Label(self.frame, text="Pokemon " + str(count) + ":", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
        self.label.grid(row=0, column=0, padx=10, pady=10)

        self.pokemonNameEntry = tk.StringVar()

        self.pokemonNameInput = Entry(self.frame, justify=CENTER, font=f"{fontName} {smallSize}",width=entryWidth, textvariable=self.pokemonNameEntry)
        self.pokemonNameInput.grid(row=0, column=1, padx=10, pady=10)

        self.moteLabel = Label(self.frame, text="Mote:", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
        self.moteLabel.grid(row=0, column=2, padx=10, pady=10)

        self.pokemonMoteEntry = tk.StringVar()

        self.pokemonMoteInput = Entry(self.frame, justify=CENTER, font=f"{fontName} {smallSize}", width=entryWidth, textvariable=self.pokemonMoteEntry)
        self.pokemonMoteInput.grid(row=0, column=3, padx=10, pady=10)

#Botón de update.
updateFrame = tk.Frame(mainFrame, bg=innerFrameColor)
updateFrame.place(relwidth=0.95, height=35, relx=0.5, y=baseYForFrames * 7.5, anchor="n")
updateButton = Button(updateFrame, text="Update team", font=f"{fontName} {mediumSize} ", bg=buttonsColor, fg=fontColor, command=lambda:UpdateTeam())
updateButton.pack(fill=X)

#Spam
debugLabelText = tk.StringVar()
spamFrame = tk.Frame(mainFrame, bg=innerFrameColor)
spamFrame.place(relwidth=0.95, height=250, relx=0.5, y=baseYForFrames * 8.5, anchor="n")
spamLabel = Label(spamFrame, text=credits, font=f"{fontName} 12 ", bg=innerFrameColor, fg=fontColor)
spamLabel.pack(fill=X)
twitchButton = Button(spamFrame, text="Twitch", font=f"{fontName} {smallSize} underline", highlightthickness = 0, bd=0, bg=buttonsColor, fg=linkColor, command=lambda:OpenURL("www.twitch.tv/Adriplodocus"))
twitchButton.pack()
twitterButton = Button(spamFrame, text="Twitter", font=f"{fontName} {smallSize} underline", highlightthickness = 0, bd=0, bg=buttonsColor, fg=linkColor, command=lambda:OpenURL("https://twitter.com/Adriplodocus"))
twitterButton.pack()
instagramButton = Button(spamFrame, text="Instagram", font=f"{fontName} {smallSize} underline", highlightthickness = 0, bd=0, bg=buttonsColor, fg=linkColor, command=lambda:OpenURL("https://www.instagram.com/adriplodocus/"))
instagramButton.pack()

#Debug
debugLabelText = tk.StringVar()
debugFrame = tk.Frame(mainFrame, bg=innerFrameColor)
debugFrame.place(relwidth=0.95, height=35, relx=0.5, y=baseYForFrames * 11.5, anchor="n")
debugLabel = Label(debugFrame, font=f"{fontName} {smallSize} ", bg=innerFrameColor, textvariable=debugLabelText)
debugLabel.pack(fill=X)

animatedSpritesFolder = "/Resources/AnimatedSprites/"
currentTeamFolder = "/Resources/CurrentTeam/"
txtFolder = "/Resources/TXTs/"
originalNamesFileName = "TeamOriginalNames.txt"
aliasNamesFileName = "TeamAliasNames.txt"

def GetFilePath():
    global p

    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.executable)
    elif __file__:
        application_path = os.path.dirname(__file__)

    p = os.path.join(application_path)

def InitPokemons(): 
    global allPokemon
    allPokemon = []

    counter = 0
    while counter < 6:
        allPokemon.append(PokemonFrame(counter))
        counter+=1

def Init():
    if os.path.exists(p + "/" + txtFolder + originalNamesFileName):
        GetOriginalNamesLines()
        originalNames = originalLines[0].split(',')

        counter = 0
        for name in originalNames:
            allPokemon[counter].pokemonNameEntry.set(name)
            counter+=1
    
    if os.path.exists(p + "/" + txtFolder + aliasNamesFileName):
        GetAliasNamesLines()
        aliasNames = aliasLines[0].split(',')

        counter = 0
        for name in aliasNames:
            allPokemon[counter].pokemonMoteEntry.set(name)
            counter+=1

def CreateJS():
    jsText = '''function changeP() {
        var pokemon1 = "%1";
        var pokemon2 = "%2";
        var pokemon3 = "%3";
        var pokemon4 = "%4";
        var pokemon5 = "%5";
        var pokemon6 = "%6";

        document.getElementById("p1").textContent = pokemon1;
        document.getElementById("p2").textContent = pokemon2;
        document.getElementById("p3").textContent = pokemon3;
        document.getElementById("p4").textContent = pokemon4;
        document.getElementById("p5").textContent = pokemon5;
        document.getElementById("p6").textContent = pokemon6;

        //%htmlImg1
        //%htmlImg2
        //%htmlImg3
        //%htmlImg4
        //%htmlImg5
        //%htmlImg6
    }
    '''

    # Creating the JS file
    file_js = open(p +"/OBS/" + "Team.js", "w", encoding="utf-8")
    # Adding the input data to the JS file
    jsText = jsText.replace("%1", nicknameList[0])
    jsText = jsText.replace("%2", nicknameList[1])
    jsText = jsText.replace("%3", nicknameList[2])
    jsText = jsText.replace("%4", nicknameList[3])
    jsText = jsText.replace("%5", nicknameList[4])
    jsText = jsText.replace("%6", nicknameList[5])

    if pokemonList[0] != "":
        jsText = jsText.replace("//%htmlImg1", '''document.getElementById("img1").src = "../Resources/CurrentTeam/".concat(document.getElementById("p1").textContent.concat(".gif"));''')
    if pokemonList[1] != "":
        jsText = jsText.replace("//%htmlImg2", '''document.getElementById("img2").src = "../Resources/CurrentTeam/".concat(document.getElementById("p2").textContent.concat(".gif"));''')
    if pokemonList[2] != "":
        jsText = jsText.replace("//%htmlImg3", '''document.getElementById("img3").src = "../Resources/CurrentTeam/".concat(document.getElementById("p3").textContent.concat(".gif"));''')
    if pokemonList[3] != "":
        jsText = jsText.replace("//%htmlImg4", '''document.getElementById("img4").src = "../Resources/CurrentTeam/".concat(document.getElementById("p4").textContent.concat(".gif"));''')
    if pokemonList[4] != "":
        jsText = jsText.replace("//%htmlImg5", '''document.getElementById("img5").src = "../Resources/CurrentTeam/".concat(document.getElementById("p5").textContent.concat(".gif"));''')
    if pokemonList[5] != "":
        jsText = jsText.replace("//%htmlImg6", '''document.getElementById("img6").src = "../Resources/CurrentTeam/".concat(document.getElementById("p6").textContent.concat(".gif"));''')
       
    file_js.write(jsText)
    # Saving the data into the JS file
    file_js.close()

def UpdateTeam():
    debugLabelText.set("")
    RemoveCurrentTeam()

    #Original names recovery.
    global pokemonList
    pokemonList = []

    counter = 0
    for pokemon in allPokemon:
        pokemonList.append(pokemon.pokemonNameInput.get().upper())
        counter+=1

    #Nicknames recovery.
    global nicknameList
    nicknameList = []

    counter = 0
    for pokemon in allPokemon:
        nicknameList.append(pokemon.pokemonMoteInput.get().upper())
        counter+=1

    if (CheckForDuplicateNames(nicknameList) == FALSE):
        counter = 0
        while counter < len(pokemonList):
            if (nicknameList[counter] == ""):
                nicknameList[counter] = pokemonList[counter]
            counter+=1

        CreateOriginalNamesFile()
        CreateAliasNamesFile()

        counter = 0
        while counter < len(pokemonList):
            if (pokemonList[counter] != ""):
                ProcessPokemon(pokemonList[counter], nicknameList[counter])
            counter+=1

        Init()
        CreateJS()
    else:
        DebugMsg("There are duplicated names. Please, check this.", errorColor)

def CheckForDuplicateNames(list):
    namesToCheck = []
    for name in list:
        if (name != ""):
            namesToCheck.append(name)

    return len(namesToCheck) != len(set(namesToCheck))

def CreateOriginalNamesFile():
    # Creating the JS file
    originalNamesFile = open(p + txtFolder + originalNamesFileName, "w", encoding="utf-8")
    # Adding the input data to the JS file
    originalNamesFile.write(
    f'''{pokemonList[0]},{pokemonList[1]},{pokemonList[2]},{pokemonList[3]},{pokemonList[4]},{pokemonList[5]}'''
    )
    # Saving the data into the JS file
    originalNamesFile.close()

def GetOriginalNamesLines():
    global originalLines
    with open(p + txtFolder + originalNamesFileName, encoding="utf-8") as f:
        originalLines = f.readlines()

def CreateAliasNamesFile():
    # Creating the JS file
    aliasNamesFile = open(p + txtFolder + aliasNamesFileName, "w", encoding="utf-8")
    # Adding the input data to the JS file
    aliasNamesFile.write(
    f'''{nicknameList[0]},{nicknameList[1]},{nicknameList[2]},{nicknameList[3]},{nicknameList[4]},{nicknameList[5]}'''
    )
    # Saving the data into the JS file
    aliasNamesFile.close()

def GetAliasNamesLines():
    global aliasLines
    with open(p + txtFolder + aliasNamesFileName, encoding="utf-8") as f:
        aliasLines = f.readlines()

def ProcessPokemon(originalName, newName):
    error = FALSE
    file = p + animatedSpritesFolder + originalName+".gif"
    if os.path.exists(p + animatedSpritesFolder + originalName + ".gif"):
        movedFile = p + currentTeamFolder + originalName + ".gif"
        Copy(file, p + currentTeamFolder)
        newF = newName + ".gif"
        os.rename(movedFile, p + currentTeamFolder + newF)
    else:
        error = TRUE

    if error == TRUE:
        DebugMsg("Some errors found on original pokemon names.\nPlease, check they're properly written.", errorColor)
    else:
        DebugMsg("The team has been succesfully generated!", correctColor)

def DebugMsg(msg, color):
    debugLabel.config(fg=color)
    debugLabelText.set(msg)

def Copy(fileName, path):
    shutil.copy2(fileName, path)

def RemoveCurrentTeam():
    global files
    files = os.listdir(p+currentTeamFolder)

    for f in files:
        os.remove(p+currentTeamFolder+f)

def OpenURL(url):
    webbrowser.open(url)

GetFilePath()
InitPokemons()
Init()
root.mainloop()