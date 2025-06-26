from tkinter import *
import tkinter as tk
from tkinter import ttk
import shutil;
import os
import sys
import webbrowser
import os
import os
from importlib.resources import files, as_file
import ctypes

class PokemonFrame:
    def __init__(self, count):
        self.frame = tk.Frame(root, bg=innerFrameColor)
        self.frame.place(relwidth=0.95, height=50, relx=0.5, rely=0.1, y=baseYForFrames * count, anchor="n")

        self.label = Label(self.frame, text="Pokemon " + str(count+1) + ":", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
        self.label.grid(row=0, column=0, padx=10, pady=10)

        self.pokemonNameEntry = tk.StringVar()

        self.pokemonNameInput = Entry(self.frame, justify=CENTER, font=f"{fontName} {smallSize}",width=entryWidth, textvariable=self.pokemonNameEntry)
        self.pokemonNameInput.grid(row=0, column=1, padx=10, pady=10)

        self.moteLabel = Label(self.frame, text="Nickname:", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
        self.moteLabel.grid(row=0, column=2, padx=10, pady=10)

        self.pokemonMoteEntry = tk.StringVar()

        self.pokemonMoteInput = Entry(self.frame, justify=CENTER, font=f"{fontName} {smallSize}", width=entryWidth, textvariable=self.pokemonMoteEntry)
        self.pokemonMoteInput.grid(row=0, column=3, padx=10, pady=10)

    def Clear(self):
        self.pokemonNameInput.delete(0, 'end')
        self.pokemonMoteInput.delete(0, 'end')

class SettingsFrame:
    def __init__(self):
        self.frame = tk.Frame(root, bg=innerFrameColor)
        self.frame.place(relwidth=0.95, height=50, relx=0.5, rely=0.1, y=baseYForFrames * 6, anchor="n")
        self.label = Label(self.frame, text="Layout:", font=f"{fontName} {smallSize}", bg=innerFrameColor, fg=fontColor)
          
#App
credits = "Made by @Adriplodocus"
appName = "Pokémon Team Visualizer"
appTitle = "Pokémon Team Visualizer"

#Colors
mainFrameColor = "#333333"
edgeColor = "#706C61"
innerFrameColor ="#333333"
buttonsColor = "#333333"
fontColor = "#E6E6E6"
linkColor = "#ff8af9"
errorColor = "#ff6161"
correctColor = "#7aff9e"
testFrameColor = "#B4B4B4"

#Font properties
fontName = "Fixedsys"
smallSize = 12
mediumSize = 15
largeSize = 20

#UI element sizes
entryWidth = 20
baseYForFrames = 35

#IO
obsFolder ="/OBS/"
currentTeamFolder = "/CurrentTeam/"
resourcesFolder ="/Resources/"
animatedSpritesFolder = "/AnimatedSprites/"
txtFolder = "/TXTs/"
originalNamesFileName = "TeamOriginalNames.txt"
aliasNamesFileName = "TeamAliasNames.txt"
gifExtension = ".gif"

#UI
root = Tk()
root.resizable(0,0) #The window size won't be modified.
root.title(appName)

#This canvas will contain all app elements.
canvas = tk.Canvas(root, height=600, width=600, bg="#E8E2DB")
canvas.pack()

mainFrame = tk.Frame(root, bg=mainFrameColor,highlightbackground=edgeColor,highlightthickness=3)
mainFrame.place(relwidth=0.985, relheight=0.985, relx=0.5, anchor=N)

titleLabel = Label(mainFrame, text=appTitle, font=f"{fontName} {largeSize} bold", bg=mainFrameColor, fg=fontColor)
titleLabel.pack()

#Layout area
settingsFrame = tk.Frame(mainFrame, bg=innerFrameColor)
settingsFrame.place(relwidth=0.985, height=85, relx=0.5, rely=0.475, anchor=N)

layoutLabel = Label(settingsFrame, text="Layout", font=f"{fontName} {mediumSize} bold", bg=mainFrameColor, fg=fontColor)
layoutLabel.pack()

layouts = ["Horizontal", "Vertical"]
layout = StringVar(value="Horizontal")  # Default value
comboBox = ttk.Combobox(settingsFrame, textvariable=layout, state="readonly", values=layouts, font=f"{fontName} {mediumSize}")
comboBox.current(0)  # Set default selection
comboBox.pack()

comboBox.bind("<<ComboboxSelected>>", lambda event: UpdateLayoutFile())

showShadows = tk.BooleanVar(value=True)
showShadowsCheck = tk.Checkbutton(settingsFrame, text="Show shadows", font=f"{fontName} {mediumSize}", bg=mainFrameColor, fg=fontColor, activebackground=mainFrameColor, selectcolor=mainFrameColor, activeforeground=fontColor, variable=showShadows)
showShadowsCheck.place(relx=0.5, rely=0.60, anchor="n")
showShadowsCheck.pack()

def UpdateShowShadows(*args):
    if os.path.exists(appDirectory + obsFolder + txtFolder + "Shadow.txt"):
        with open(appDirectory + obsFolder + txtFolder + "Shadow.txt", "w", encoding="utf-8") as f:
            f.write(str(showShadows.get()))

showShadows.trace_add("write", UpdateShowShadows)

showPokeballBackground = tk.BooleanVar(value=True)
showPokeballBackgroundCheck = tk.Checkbutton(settingsFrame, text="Show pokeball background", font=f"{fontName} {mediumSize}", bg=mainFrameColor, fg=fontColor, activebackground=mainFrameColor, selectcolor=mainFrameColor, activeforeground=fontColor, variable=showPokeballBackground)
showPokeballBackgroundCheck.place(relx=0.5, rely=0.60, anchor="n")
showPokeballBackgroundCheck.pack()

def UpdateShowPokeballBackground(*args):
    if os.path.exists(appDirectory + obsFolder + txtFolder + "ShowBackground.txt"):
        with open(appDirectory + obsFolder + txtFolder + "ShowBackground.txt", "w", encoding="utf-8") as f:
            f.write(str(showPokeballBackground.get()))

showPokeballBackground.trace_add("write", UpdateShowPokeballBackground)

#Buttons
buttonsFrame = tk.Frame(mainFrame, bg=innerFrameColor)
buttonsFrame.place(relwidth=0.985, height=60, relx=0.5, rely=0.635, anchor=N)

updateFrame = tk.Frame(buttonsFrame, bg=innerFrameColor)
updateFrame.place(relwidth=0.95, height=35, relx=0.5, rely=0, anchor="n")
updateButton = Button(updateFrame, text="Update team", font=f"{fontName} {mediumSize} ", bg=buttonsColor, fg=fontColor, activebackground=buttonsColor, command=lambda:UpdateTeam())
updateButton.pack(fill=X)

resetFrame = tk.Frame(buttonsFrame, bg=innerFrameColor)
resetFrame.place(relwidth=0.95, height=35, relx=0.5, rely=0.5, anchor="n")
resetButton = Button(resetFrame, text="Reset team data", font=f"{fontName} {mediumSize} ", bg=buttonsColor, fg=fontColor, activebackground=buttonsColor, command=lambda:ResetData())
resetButton.pack(fill=X)

#Spam
spamFrame = tk.Frame(mainFrame, bg=innerFrameColor)
spamFrame.place(relwidth=0.95, height=250, relx=0.5, rely=0.85, anchor="n")
spamLabel = Label(spamFrame, text=credits, font=f"{fontName} 12 ", bg=innerFrameColor, fg=fontColor)
spamLabel.pack(fill=X)
twitchButton = Button(spamFrame, text="Twitch", font=f"{fontName} {smallSize} underline", highlightthickness = 0, bd=0, bg=buttonsColor, fg=linkColor, command=lambda:OpenURL("www.twitch.tv/Adriplodocus"))
twitchButton.pack()
twitterButton = Button(spamFrame, text="X", font=f"{fontName} {smallSize} underline", highlightthickness = 0, bd=0, bg=buttonsColor, fg=linkColor, command=lambda:OpenURL("https://twitter.com/Adriplodocus"))
twitterButton.pack()
instagramButton = Button(spamFrame, text="Instagram", font=f"{fontName} {smallSize} underline", highlightthickness = 0, bd=0, bg=buttonsColor, fg=linkColor, command=lambda:OpenURL("https://www.instagram.com/adriplodocus/"))
instagramButton.pack()

#Debug. Must be placed after #Spam frame to avoid overlapping.
debugFrame = tk.Frame(mainFrame, bg=innerFrameColor)
debugFrame.place(relwidth=0.95, height=35, relx=0.5, y=baseYForFrames * 12.5, anchor="n")
debugLabelText = tk.StringVar()
debugLabel = Label(debugFrame, font=f"{fontName} {smallSize} ", bg=innerFrameColor, textvariable=debugLabelText)
debugLabel.pack(fill=X)

allPokemon = [PokemonFrame(0), PokemonFrame(1), PokemonFrame(2), PokemonFrame(3), PokemonFrame(4), PokemonFrame(5)]
pokemonList = []
nicknameList = []

maxPokemon = 6

#region IO
def GetAppPath():
    if getattr(sys, 'frozen', False):
        application_path = os.path.dirname(sys.executable)
    elif __file__:
        application_path = os.path.dirname(__file__)

    return os.path.join(application_path)

appDirectory = GetAppPath()

def Hide(path):
    FILE_ATTRIBUTE_HIDDEN = 0x02
    ret = ctypes.windll.kernel32.SetFileAttributesW(path, FILE_ATTRIBUTE_HIDDEN)

horizontalHTMLTemplate = '''
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
            #pokeballBackground1, #pokeballBackground2, #pokeballBackground3, #pokeballBackground4, #pokeballBackground5, #pokeballBackground6 {
                position: absolute;
                width: 225px;
                height: 150px;
                z-index: -1;
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
            <div class="pkDiv"> %pkDivContent1 </div>
            <div class="pkDiv"> %pkDivContent2 </div>
            <div class="pkDiv"> %pkDivContent3 </div>
            <div class="pkDiv"> %pkDivContent4 </div>
            <div class="pkDiv"> %pkDivContent5 </div>
            <div class="pkDiv"> %pkDivContent6 </div>
        </div>
        <div class="container">
            <div class="shadowDiv">
                <img id="shadow1">
            </div>       
            <div class="shadowDiv">
                <img id="shadow2">
            </div>       
            <div class="shadowDiv">
                <img id="shadow3">
            </div>        
            <div class="shadowDiv">
                <img id="shadow4">
            </div>        
            <div class="shadowDiv">
                <img id="shadow5">
            </div>        
            <div class="shadowDiv">
                <img id="shadow6">
            </div>
        </div>
    </body>
</html>
    '''
verticalHtmlTemplate = '''
 <html>
    <head>
        <script src="Team.js"></script>
        <meta charset="UTF-8">
        <style>
            .wrapper {
                display: flex;
                flex-direction: column;
            }

            .pair {
                display: flex;
                flex-direction: column;
                margin: 0;
                padding: 0;
                margin-bottom: 20px;
                width: 225px;
                align-items: center;
            }

            .pkDiv, .shadowDiv {
                margin: 0;
                padding: 0;
            }

            .pkDiv {
                width: 225px;
            }

            .shadowDiv {
                width: 150px;
            }

            #pokeballBackground1, #pokeballBackground2, #pokeballBackground3, #pokeballBackground4, #pokeballBackground5, #pokeballBackground6 {
                position: absolute;
                width: 225px;
                height: 150px;
                z-index: -1;
            }

            .shadowDiv {
            margin-top: -15px;
            }

            img {
                display: block; /* elimina espacios fantasmas debajo de imágenes */
                width: 100%;
                height: auto;
                max-height: 100px; /* ajusta si quieres */
                object-fit: contain;
            }

            p {
                margin: 0;
                padding: 0;
                height: 25px;
                color: white;
                font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
                font-size: 25px;
                text-align: center;
            }
        </style>
    </head>

    <body onload="changeP()">
        <div class="wrapper">
            <div class="pair">
                <div class="pkDiv"> %pkDivContent1 </div>
                <div class="shadowDiv">
                <img id="shadow1"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent2 </div>
                <div class="shadowDiv">
                    <img id="shadow2"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent3 </div>
                <div class="shadowDiv">
                    <img id="shadow3"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent4 </div>
                <div class="shadowDiv">
                    <img id="shadow4"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent5 </div>
                <div class="shadowDiv">
                    <img id="shadow5"></img>
                </div>
            </div>
            <div class="pair">
                <div class="pkDiv"> %pkDivContent6 </div>
                <div class="shadowDiv">
                    <img id="shadow6"></img>
                </div>
            </div>
        </div>
    </body>
</html>
'''

def CreateHTML():
    htmlText = horizontalHTMLTemplate if layout.get() == "Horizontal" else verticalHtmlTemplate

    for i in range(0, len(pokemonList)):
        codeText = f'''<p id="p{i+1}"></p>'''

        if showPokeballBackground.get() == True and pokemonList[i] != "":
            codeText += f'''<img id="pokeballBackground{i+1}">'''
        
        codeText += f'''<img id="img{i+1}">'''

        htmlText = htmlText.replace(f"%pkDivContent{i+1}", codeText)

    # Creating the JS file
    file_html = open(appDirectory + obsFolder + "TeamVisualizer.html", "w", encoding="utf-8")
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

        //%htmlReplacement1
        //%htmlReplacement2
        //%htmlReplacement3
        //%htmlReplacement4
        //%htmlReplacement5
        //%htmlReplacement6
    }'''

    # Creating the JS file
    file_js = open(appDirectory + obsFolder + "Team.js", "w", encoding="utf-8")

    # Adding the input data to the JS file
    for i in range(0, maxPokemon):
        pokemonNamePlaceholder = f"%{i+1}"
        jsText = jsText.replace(pokemonNamePlaceholder, nicknameList[i])
    
#             <div class="pkDiv">
#                 <p id="p1"></p>
#                 <img id="pokeballBackground1">
#                 <img id="img1">
#             </div>

        if pokemonList[i] != "":
            codeText = f'''document.getElementById("img{i+1}").src = "../OBS/CurrentTeam/".concat(document.getElementById("p{i+1}").textContent.concat(".gif"));'''

            if showShadows.get() == True:
                codeText += f'''
        document.getElementById("shadow{i+1}").src = "https://i.postimg.cc/xdmpF4Tm/Shadow.png";'''

            if showPokeballBackground.get() == True:
                codeText += f'''
        document.getElementById("pokeballBackground{i+1}").src = "https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png";'''

            jsText = jsText.replace(f"//%htmlReplacement{i+1}", codeText)
       
    file_js.write(jsText)
    # Hide(appDirectory + obsFolder + "Team.js")
    file_js.close()

def CreateShadowsFile():
    if not os.path.exists(appDirectory + obsFolder + txtFolder + "Shadow.txt"):
        layoutFile = open(appDirectory + obsFolder + txtFolder + "Shadow.txt", "w", encoding="utf-8")
        layoutFile.write(str(showShadows.get()))
        layoutFile.close() 

def CreateLayoutFile():
    if not os.path.exists(appDirectory + obsFolder + txtFolder + "Layout.txt"):
        layoutFile = open(appDirectory + obsFolder + txtFolder + "Layout.txt", "w", encoding="utf-8")
        layoutFile.write(layout.get())
        layoutFile.close()

def CreateShowBackgroundFile():
    if not os.path.exists(appDirectory + obsFolder + txtFolder + "ShowBackground.txt"):
        showBackgroundFile = open(appDirectory + obsFolder + txtFolder + "ShowBackground.txt", "w", encoding="utf-8")
        showBackgroundFile.write(str(showPokeballBackground.get()))
        showBackgroundFile.close()

def UpdateLayoutFile():
    if os.path.exists(appDirectory + obsFolder + txtFolder + "Layout.txt"):
        with open(appDirectory + obsFolder + txtFolder + "Layout.txt", "w", encoding="utf-8") as f:
            f.write(layout.get())

def GetShowShadows():
    if os.path.exists(appDirectory + obsFolder + txtFolder + "Shadow.txt"):
        with open(appDirectory + obsFolder + txtFolder + "Shadow.txt", encoding="utf-8") as f:
            showShadows.set(f.read().strip() == 'True')

def GetLayout():
    if os.path.exists(appDirectory + obsFolder + txtFolder + "Layout.txt"):
        with open(appDirectory + obsFolder + txtFolder + "Layout.txt", encoding="utf-8") as f:
            layout.set(f.read().strip())

def GetShowPokeballBackground():
    if os.path.exists(appDirectory + obsFolder + txtFolder + "ShowBackground.txt"):
        with open(appDirectory + obsFolder + txtFolder + "ShowBackground.txt", encoding="utf-8") as f:
            showPokeballBackground.set(f.read().strip() == 'True')

def CreateBaseFolders():
    if os.path.exists(appDirectory + obsFolder) == FALSE:
        os.mkdir(appDirectory + obsFolder)

    if os.path.exists(appDirectory + obsFolder + currentTeamFolder) == FALSE:
        os.mkdir(appDirectory + obsFolder + currentTeamFolder)
        Hide(appDirectory + obsFolder + currentTeamFolder)

    if os.path.exists(appDirectory + obsFolder + txtFolder) == FALSE:
        os.mkdir(appDirectory + obsFolder + txtFolder)
        Hide(appDirectory + obsFolder + txtFolder)

def CreateOriginalNamesFile():
    originalNamesFile = open(appDirectory + obsFolder + txtFolder + originalNamesFileName, "w", encoding="utf-8")
    originalNamesFile.write(
    f'''{pokemonList[0]},{pokemonList[1]},{pokemonList[2]},{pokemonList[3]},{pokemonList[4]},{pokemonList[5]}'''
    )
    originalNamesFile.close()

def ResetOriginalNamesFile():
    originalNamesFile = open(appDirectory + obsFolder + txtFolder + originalNamesFileName, "w", encoding="utf-8")
    originalNamesFile.write(
    f''',,,,,'''
    )
    originalNamesFile.close()

def GetOriginalNamesLines():
    global originalLines
    with open(appDirectory + obsFolder + txtFolder + originalNamesFileName, encoding="utf-8") as f:
        originalLines = f.readlines()

def CreateAliasNamesFile():
    aliasNamesFile = open(appDirectory + obsFolder + txtFolder + aliasNamesFileName, "w", encoding="utf-8")
    aliasNamesFile.write(
    f'''{nicknameList[0]},{nicknameList[1]},{nicknameList[2]},{nicknameList[3]},{nicknameList[4]},{nicknameList[5]}'''
    )
    aliasNamesFile.close()

def ResetAliasNamesFile():
    aliasNamesFile = open(appDirectory + obsFolder + txtFolder + aliasNamesFileName, "w", encoding="utf-8")
    aliasNamesFile.write(
    f''',,,,,'''
    )
    aliasNamesFile.close()

def Copy(fileName, path):
    shutil.copy2(fileName, path)
#endregion

def Init():
    CreateBaseFolders()

    if os.path.exists(appDirectory + obsFolder + txtFolder + originalNamesFileName):
        GetOriginalNamesLines()
        originalNames = originalLines[0].split(',')

        counter = 0
        for name in originalNames:
            allPokemon[counter].pokemonNameEntry.set(name)
            counter+=1
    
    if os.path.exists(appDirectory + obsFolder + txtFolder + aliasNamesFileName):
        GetAliasNamesLines()
        aliasNames = aliasLines[0].split(',')

        counter = 0
        for name in aliasNames:
            allPokemon[counter].pokemonMoteEntry.set(name)
            counter+=1
    
    CreateShadowsFile()
    GetShowShadows()

    CreateLayoutFile()
    GetLayout()

    CreateShowBackgroundFile()
    GetShowPokeballBackground()


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
    UpdateTeam()
    DebugMsg("All data reseted.", errorColor)

def UpdateTeam():
    debugLabelText.set("")

    RemoveCurrentTeam()

    pokemonList.clear()
    nicknameList.clear()

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

def CheckForDuplicateNames(list):
    namesToCheck = []
    for name in list:
        if (name != ""):
            namesToCheck.append(name)

    return len(namesToCheck) != len(set(namesToCheck))

def GetAliasNamesLines():
    global aliasLines
    with open(appDirectory + obsFolder + txtFolder + aliasNamesFileName, encoding="utf-8") as f:
        aliasLines = f.readlines()

def ProcessPokemon(originalName, newName):
    resource_path = "AnimatedSprites/" + originalName + gifExtension  # No leading '/'
    
    try:
        # Access the resource using importlib.resources
        ref = files('Resources') / resource_path  # Replace 'my_package' with your actual package name
        with as_file(ref) as path:
            gif_data = str(path)  # This gives you the file path

            # Proceed with copying the resource and renaming the file
            Copy(gif_data, appDirectory + obsFolder + currentTeamFolder)

            copiedFile = appDirectory + obsFolder + currentTeamFolder + originalName + gifExtension
            os.rename(copiedFile, appDirectory + obsFolder + currentTeamFolder + newName + gifExtension)
        
        DebugMsg("The team has been successfully generated!", correctColor)

    except Exception as e:
        DebugMsg("Some errors found on original pokemon names.\nPlease, check they're properly written.", errorColor)
        print(str(e))  # Optional, to see the error if needed

def DebugMsg(msg, color):
    debugLabel.config(fg=color)
    debugLabelText.set(msg)

def RemoveCurrentTeam():
    files = os.listdir(appDirectory + obsFolder + currentTeamFolder)

    for f in files:
        os.remove(appDirectory + obsFolder + currentTeamFolder + f)

def OpenURL(url):
    webbrowser.open(url)

GetAppPath()
Init()

root.mainloop()