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
    file_html = open(appDirectory + constants.obsFolder + constants.teamVisualizerFileName, "w", encoding="utf-8")
    file_html.write(htmlText)
    file_html.close()

def CreateJS(appDirectory, maxPokemon, pokemonList, showShadows, showPokeballBackground):
    entries = []
    for i in range(maxPokemon):
        if i < len(pokemonList) and pokemonList[i].name != "":
            p = pokemonList[i]
            shadow = 'true' if showShadows.get() else 'false'
            bg     = 'true' if showPokeballBackground.get() else 'false'
            entries.append(f'  {{"name":"{p.fileName}","alias":"{p.mote}","shadow":{shadow},"bg":{bg}}}')
        else:
            entries.append('  {"name":"","alias":"","shadow":false,"bg":false}')

    jsText = 'window.teamData = [\n' + ',\n'.join(entries) + '\n];\n\n'
    jsText += (
        'function changeP() {\n'
        '    var saved = null;\n'
        '    try { saved = JSON.parse(localStorage.getItem("pkOrder")); } catch(e) {}\n'
        '    var order = (Array.isArray(saved) && saved.length === 6) ? saved : [0,1,2,3,4,5];\n'
        '    renderTeam(order);\n'
        '}'
    )

    file_js = open(appDirectory + constants.obsFolder + constants.jsFileName, "w", encoding="utf-8")
    file_js.write(jsText)
    file_js.close()

    import time
    with open(appDirectory + constants.obsFolder + constants.versionFileName, "w", encoding="utf-8") as f:
        f.write(str(int(time.time())))

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
                    "skin": "common",
                    "shiny": "False"
                }
            }
        ],
        "pokemon2": [
            {
                "name": "",
                "mote": "",
                "properties": {
                    "gender": "male",
                    "skin": "common",
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
                    "skin": "common",
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
                    "skin": "common",
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
                    "skin": "common",
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
                    "skin": "common",
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