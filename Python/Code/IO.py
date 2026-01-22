import shutil;
import sys
import ctypes
import Code.Templates as templates
import Code.Constants as constants
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def Hide(path):
    FILE_ATTRIBUTE_HIDDEN = 0x02
    ret = ctypes.windll.kernel32.SetFileAttributesW(path, FILE_ATTRIBUTE_HIDDEN)

def CreateHTML(appDirectory, layout, pokemonList, showPokeballBackground):
    htmlText = templates.horizontalHTMLTemplate if layout.get() == "Horizontal" else templates.verticalHtmlTemplate

    for i in range(0, len(pokemonList)):
        codeText = f'''<p id="p{i+1}"></p>'''

        if showPokeballBackground.get() == True and pokemonList[i].name != "":
            codeText += f'''<img id="pokeballBackground{i+1}">'''
        
        codeText += f'''<img id="img{i+1}">'''

        htmlText = htmlText.replace(f"%pkDivContent{i+1}", codeText)

    # Creating the JS file
    file_html = open(appDirectory + constants.obsFolder + constants.teamVisualizerFileName, "w", encoding="utf-8")
    file_html.write(htmlText)
    file_html.close()

def CreateJS(appDirectory, maxPokemon, pokemonList, showShadows, showPokeballBackground):
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
    file_js = open(appDirectory + constants.obsFolder + constants.jsFileName, "w", encoding="utf-8")

    # Adding the input data to the JS file
    for i in range(0, maxPokemon):
        pokemonNamePlaceholder = f"%{i+1}"

        if i >= len(pokemonList):
            mote = ""
            name = ""
        else:
            mote = pokemonList[i].mote
            name = pokemonList[i].name

        jsText = jsText.replace(pokemonNamePlaceholder, mote)

        if name != "":
            codeText = f'''document.getElementById("img{i+1}").src = "../OBS/CurrentTeam/".concat(document.getElementById("p{i+1}").textContent.concat(".gif"));'''

            if showShadows.get() == True:
                codeText += f'''
        document.getElementById("shadow{i+1}").src = "https://i.postimg.cc/xdmpF4Tm/Shadow.png";'''

            if showPokeballBackground.get() == True:
                codeText += f'''
        document.getElementById("pokeballBackground{i+1}").src = "https://i.postimg.cc/0QdW9KS2/Pokeball-Background.png";'''

            jsText = jsText.replace(f"//%htmlReplacement{i+1}", codeText)
       
    file_js.write(jsText)
    # Hide(appDirectory + constants.obsFolder + "Team.js")
    file_js.close()

def CreateShadowsFile(appDirectory, showShadows):
    if not os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.shadowsFileName):
        layoutFile = open(appDirectory + constants.obsFolder + constants.txtFolder + constants.shadowsFileName, "w", encoding="utf-8")
        layoutFile.write(str(showShadows.get()))
        layoutFile.close() 

def CreateLayoutFile(appDirectory, layout):
    if not os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.layoutFileName):
        layoutFile = open(appDirectory + constants.obsFolder + constants.txtFolder + constants.layoutFileName, "w", encoding="utf-8")
        layoutFile.write(layout.get())
        layoutFile.close()

def CreateShowBackgroundFile(appDirectory, showPokeballBackground):
    if not os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.showBackgroundFileName):
        showBackgroundFile = open(appDirectory + constants.obsFolder + constants.txtFolder + constants.showBackgroundFileName, "w", encoding="utf-8")
        showBackgroundFile.write(str(showPokeballBackground.get()))
        showBackgroundFile.close()

def CreateJsonFile(appDirectory, override):
    if override or not os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.jsonFileName):
        jsonFile = open(appDirectory + constants.obsFolder + constants.txtFolder + constants.jsonFileName, "w", encoding="utf-8")
        jsonFile.write(
'''{
    "pokemon": {
        "pokemon1": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common"
                    "shiny": "False",
                }
            }
        ],
        "pokemon2": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common"
                    "shiny": "False"
                }
            }
        ],
        "pokemon3": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common"
                    "shiny": "False"
                }
            }
        ],
        "pokemon4": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common"
                    "shiny": "False"
                }
            }
        ],
        "pokemon5": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common"
                    "shiny": "False"
                }
            }
        ],
        "pokemon6": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common"
                    "shiny": "False"
                }
            }
        ]
    }
}
'''
        )
        jsonFile.close()

def UpdateLayoutFile(appDirectory, layout):
    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.layoutFileName):
        with open(appDirectory + constants.obsFolder + constants.txtFolder + constants.layoutFileName, "w", encoding="utf-8") as f:
            f.write(layout.get())

def GetShowShadows(appDirectory, showShadows):
    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.shadowsFileName):
        with open(appDirectory + constants.obsFolder + constants.txtFolder + constants.shadowsFileName, encoding="utf-8") as f:
            showShadows.set(f.read().strip() == 'True')

def GetLayout(appDirectory, layout):
    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.layoutFileName):
        with open(appDirectory + constants.obsFolder + constants.txtFolder + constants.layoutFileName, encoding="utf-8") as f:
            layout.set(f.read().strip())

def GetShowPokeballBackground(appDirectory, showPokeballBackground):
    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.showBackgroundFileName):
        with open(appDirectory + constants.obsFolder + constants.txtFolder + constants.showBackgroundFileName, encoding="utf-8") as f:
            showPokeballBackground.set(f.read().strip() == 'True')

def CreateBaseFolders(appDirectory):
    if os.path.exists(appDirectory + constants.obsFolder) == False:
        os.mkdir(appDirectory + constants.obsFolder)

    if os.path.exists(appDirectory + constants.obsFolder + constants.currentTeamFolder) == False:
        os.mkdir(appDirectory + constants.obsFolder + constants.currentTeamFolder)
        Hide(appDirectory + constants.obsFolder + constants.currentTeamFolder)

    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder) == False:
        os.mkdir(appDirectory + constants.obsFolder + constants.txtFolder)
        Hide(appDirectory + constants.obsFolder + constants.txtFolder)

def UpdateShowShadows(*args, showShadows, appDirectory):
    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.shadowsFileName):
        with open(appDirectory + constants.obsFolder + constants.txtFolder + constants.shadowsFileName, "w", encoding="utf-8") as f:
            f.write(str(showShadows.get()))

def UpdateShowPokeballBackground(*args, showPokeballBackground, appDirectory):
    if os.path.exists(appDirectory + constants.obsFolder + constants.txtFolder + constants.showBackgroundFileName):
        with open(appDirectory + constants.obsFolder + constants.txtFolder + constants.showBackgroundFileName, "w", encoding="utf-8") as f:
            f.write(str(showPokeballBackground.get()))

def Copy(fileName, path):
    shutil.copy2(fileName, path)