from ast import Delete
from tkinter import *
import tkinter as tk
import shutil;
import os
import sys
import webbrowser
from winreg import DeleteKey

class PokemonFrame:
    def __init__(self, count):
        self.frame = tk.Frame(root, bg=innerFrameColor)
        self.frame.place(relwidth=0.95, height=50, relx=0.5, rely=0.1, y=baseYForFrames * count, anchor="n")

        self.label = Label(self.frame, text="Pokemon " + str(count+1) + ":", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
        self.label.grid(row=0, column=0, padx=10, pady=10)

        self.pokemonNameEntry = tk.StringVar()

        self.pokemonNameInput = Entry(self.frame, justify=CENTER, font=f"{fontName} {smallSize}",width=entryWidth, textvariable=self.pokemonNameEntry)
        self.pokemonNameInput.grid(row=0, column=1, padx=10, pady=10)

        self.moteLabel = Label(self.frame, text="Mote:", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
        self.moteLabel.grid(row=0, column=2, padx=10, pady=10)

        self.pokemonMoteEntry = tk.StringVar()

        self.pokemonMoteInput = Entry(self.frame, justify=CENTER, font=f"{fontName} {smallSize}", width=entryWidth, textvariable=self.pokemonMoteEntry)
        self.pokemonMoteInput.grid(row=0, column=3, padx=10, pady=10)

    def Clear(self):
        self.pokemonNameInput.delete(0, 'end')
        self.pokemonMoteInput.delete(0, 'end')
            
#App
credits = "Made by Adriplodocus."
appName = "Pokémon team visualizer by @Adriplodocus"
appTitle = "Pokémon team visualizer"

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

#UI element sizes
entryWidth = 20
baseYForFrames = 35

#IO
animatedSpritesFolder = "/Resources/AnimatedSprites/"
currentTeamFolder = "/Resources/CurrentTeam/"
txtFolder = "/Resources/TXTs/"
originalNamesFileName = "TeamOriginalNames.txt"
aliasNamesFileName = "TeamAliasNames.txt"
gifExtension = ".gif"

#UI
root = Tk()
root.resizable(0,0) #The window size won't be modified.
root.title(appName)

#This canvas will contain all app elements.
canvas = tk.Canvas(root, height=500, width=600, bg="#E8E2DB")
canvas.pack()

mainFrame = tk.Frame(root, bg=mainFrameColor,highlightbackground=edgeColor,highlightthickness=3)
mainFrame.place(relwidth=0.985, relheight=0.985, relx=0.5, anchor=N)

titleLabel = Label(mainFrame, text=appTitle, font=f"{fontName} {largeSize} bold", bg=mainFrameColor, fg=fontColor)
titleLabel.pack()

#Update button
updateFrame = tk.Frame(mainFrame, bg=innerFrameColor)
updateFrame.place(relwidth=0.95, height=35, relx=0.5, y=baseYForFrames * 7.75, anchor="n")
updateButton = Button(updateFrame, text="Update team", font=f"{fontName} {mediumSize} ", bg=buttonsColor, fg=fontColor, command=lambda:UpdateTeam())
updateButton.pack(fill=X)

#Update button
resetFrame = tk.Frame(mainFrame, bg=innerFrameColor)
resetFrame.place(relwidth=0.95, height=35, relx=0.5, y=baseYForFrames * 8.75, anchor="n")
resetButton = Button(resetFrame, text="Reset all data", font=f"{fontName} {mediumSize} ", bg=buttonsColor, fg=fontColor, command=lambda:ResetData())
resetButton.pack(fill=X)

#Spam
debugLabelText = tk.StringVar()
spamFrame = tk.Frame(mainFrame, bg=innerFrameColor)
spamFrame.place(relwidth=0.95, height=250, relx=0.5, y=baseYForFrames * 10, anchor="n")
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
debugFrame.place(relwidth=0.95, height=35, relx=0.5, y=baseYForFrames * 12.5, anchor="n")
debugLabel = Label(debugFrame, font=f"{fontName} {smallSize} ", bg=innerFrameColor, textvariable=debugLabelText)
debugLabel.pack(fill=X)

allPokemon = [PokemonFrame(0), PokemonFrame(1), PokemonFrame(2), PokemonFrame(3), PokemonFrame(4), PokemonFrame(5)]
pokemonList = []
nicknameList = []

maxPokemon = 6

def GetFilePath():
    global p

    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.executable)
    elif __file__:
        application_path = os.path.dirname(__file__)

    p = os.path.join(application_path)

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

def CreateHTML():
    htmlText = '''
        <html>
            <head>
                <script src="Team.js"></script>
                <meta charset="UTF-8">
                <style>
                    .pkDiv{
                        width:225px;
                        height: 150px;
                        float: left;
                    }
                    .shadowDiv{
                        width:225px;
                        height: 150px;
                        float: left;
                        padding-top: 80px;
                    }
                    img {
                        width: 100%;
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    p {
                        height: 25px;
                        color: white;
                        text-align: center;
                        font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
                        font-size: 35px;
                    }
                    .container{
                        clear: both;
                    }
                </style>
            </head>

            <body onload="changeP()">
                <div class="container">
                    <div class="pkDiv">
                        <p id="p1"></p>
                        <img id="img1">
                    </div>
                    <div class="pkDiv">
                        <p id="p2"></p>
                        <img id="img2">
                    </div>
                    <div class="pkDiv">
                        <p id="p3"></p>
                        <img id="img3">
                    </div>
                    <div class="pkDiv">
                        <p id="p4"></p>
                        <img id="img4">
                    </div>
                    <div class="pkDiv">
                        <p id="p5"></p>
                        <img id="img5">
                    </div>
                    <div class="pkDiv">
                        <p id="p6"></p>
                        <img id="img6">
                    </div>
                </div>
                <div class="container">
                    <div class="shadowDiv">
                        <img src="../Resources/Shadow.png">
                    </div>       
                    <div class="shadowDiv">
                        <img src="../Resources/Shadow.png">
                    </div>       
                    <div class="shadowDiv">
                        <img src="../Resources/Shadow.png">
                    </div>        
                    <div class="shadowDiv">
                        <img src="../Resources/Shadow.png">
                    </div>        
                    <div class="shadowDiv">
                        <img src="../Resources/Shadow.png">
                    </div>        
                    <div class="shadowDiv">
                        <img src="../Resources/Shadow.png">
                    </div>
                </div>
            </body>
        </html>
    '''
    # Creating the JS file
    file_html = open(p +"/OBS/" + "TeamVisualizer.html", "w", encoding="utf-8")
    file_html.write(htmlText)
    file_html.close()

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

def ClearTextFields():
    counter = 0
    while counter < maxPokemon:
        allPokemon[counter].Clear()
        counter+=1

def ResetData():
    RemoveCurrentTeam()
    ResetOriginalNamesFile()
    ResetAliasNamesFile()
    ClearTextFields()
    DebugMsg("All data reseted.", errorColor)

def UpdateTeam():
    debugLabelText.set("")
    RemoveCurrentTeam()

    #Original names recovery.
    counter = 0
    for pokemon in allPokemon:
        pokemonList.append(pokemon.pokemonNameInput.get().upper())
        counter+=1

    #Nicknames recovery.
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
        CreateHTML()
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
    originalNamesFile = open(p + txtFolder + originalNamesFileName, "w", encoding="utf-8")
    originalNamesFile.write(
    f'''{pokemonList[0]},{pokemonList[1]},{pokemonList[2]},{pokemonList[3]},{pokemonList[4]},{pokemonList[5]}'''
    )
    originalNamesFile.close()

def ResetOriginalNamesFile():
    originalNamesFile = open(p + txtFolder + originalNamesFileName, "w", encoding="utf-8")
    originalNamesFile.write(
    f''',,,,,'''
    )
    originalNamesFile.close()

def GetOriginalNamesLines():
    global originalLines
    with open(p + txtFolder + originalNamesFileName, encoding="utf-8") as f:
        originalLines = f.readlines()

def CreateAliasNamesFile():
    aliasNamesFile = open(p + txtFolder + aliasNamesFileName, "w", encoding="utf-8")
    aliasNamesFile.write(
    f'''{nicknameList[0]},{nicknameList[1]},{nicknameList[2]},{nicknameList[3]},{nicknameList[4]},{nicknameList[5]}'''
    )
    aliasNamesFile.close()

def ResetAliasNamesFile():
    aliasNamesFile = open(p + txtFolder + aliasNamesFileName, "w", encoding="utf-8")
    aliasNamesFile.write(
    f''',,,,,'''
    )
    aliasNamesFile.close()

def GetAliasNamesLines():
    global aliasLines
    with open(p + txtFolder + aliasNamesFileName, encoding="utf-8") as f:
        aliasLines = f.readlines()

def ProcessPokemon(originalName, newName):
    error = FALSE
    file = p + animatedSpritesFolder + originalName + gifExtension
    if os.path.exists(p + animatedSpritesFolder + originalName + gifExtension):
        movedFile = p + currentTeamFolder + originalName + gifExtension
        Copy(file, p + currentTeamFolder)
        newF = newName + gifExtension
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
Init()

root.mainloop()