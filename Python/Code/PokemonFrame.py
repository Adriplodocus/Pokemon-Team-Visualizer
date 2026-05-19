import customtkinter as ctk
import tkinter as tk
import sys
import os
import copy

from Code import Constants as constants
from Code.FrameData import FrameData
from Code import PokemonCatalog as pokemonCatalog

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class PokemonFrame:
    def __init__(self, count, root):
        default_properties = copy.deepcopy(pokemonCatalog.default_props)

        self.frameData = FrameData(
            name='',
            mote='',
            properties=default_properties
        )

        self.frame = ctk.CTkFrame(root, fg_color=constants.innerFrameColor, corner_radius=0, height=50)
        self.frame.pack(fill="x", padx=10, pady=(3, 0))

        _label_font = ctk.CTkFont(family=constants.fontName, size=constants.smallSize)
        _entry_font = ctk.CTkFont(family=constants.fontName, size=constants.smallSize)

        self.label = ctk.CTkLabel(self.frame, text=constants.pokemonName + str(count + 1) + ":",
                                  font=_label_font, text_color=constants.fontColor, fg_color="transparent")
        self.moteLabel = ctk.CTkLabel(self.frame, text=constants.pokemonNickname,
                                      font=_label_font, text_color=constants.fontColor, fg_color="transparent")

        self.pokemonNameEntry = tk.StringVar()
        self.pokemonMoteEntry = tk.StringVar()

        self.pokemonNameInput = ctk.CTkComboBox(self.frame, variable=self.pokemonNameEntry,
                                              values=[], font=_entry_font, width=170,
                                              fg_color=constants.entryColor, text_color=constants.fontColor,
                                              border_color=constants.edgeColor, border_width=1,
                                              button_color=constants.buttonsColor,
                                              button_hover_color=constants.buttonHoverColor,
                                              dropdown_fg_color=constants.innerFrameColor,
                                              dropdown_text_color=constants.fontColor,
                                              dropdown_hover_color=constants.buttonHoverColor)
        self.pokemonMoteInput = ctk.CTkEntry(self.frame, justify="center", font=_entry_font,
                                             width=130, textvariable=self.pokemonMoteEntry,
                                             fg_color=constants.entryColor, text_color=constants.fontColor,
                                             border_color=constants.edgeColor, border_width=1)

        self.label.grid(row=0, column=0, padx=10)
        self.moteLabel.grid(row=0, column=2, padx=10)
        self.pokemonNameInput.grid(row=0, column=1, padx=10)
        self.pokemonMoteInput.grid(row=0, column=3, padx=10)

        _icon_font = ctk.CTkFont(family=constants.fontName, size=constants.smallSize)
        self.genderIcon = ctk.CTkLabel(self.frame, text="♂", font=_icon_font,
                                       text_color="#6699ff", fg_color="transparent", width=18)
        self.skinIcon   = ctk.CTkLabel(self.frame, text="◆", font=_icon_font,
                                       text_color="#555555", fg_color="transparent", width=18)
        self.shinyIcon  = ctk.CTkLabel(self.frame, text="★", font=_icon_font,
                                       text_color="#555555", fg_color="transparent", width=18)
        self.genderIcon.grid(row=0, column=4, padx=(8, 0))
        self.skinIcon.grid(  row=0, column=5, padx=(4, 0))
        self.shinyIcon.grid( row=0, column=6, padx=(4, 0))

        self.updateButton = ctk.CTkButton(
            self.frame,
            text=constants.pokemonPropertiesText,
            font=ctk.CTkFont(family=constants.fontName, size=constants.smallSize),
            fg_color=constants.buttonsColor, hover_color=constants.buttonHoverColor,
            text_color=constants.fontColor, corner_radius=6, width=90,
            command=lambda: self.openUpdateWindow(self.pokemonNameEntry.get())
        )
        self.updateButton.grid(row=0, column=7, padx=10)

        self.clearButton = ctk.CTkButton(
            self.frame, text="✕", font=_label_font,
            fg_color=constants.resetButtonColor, hover_color=constants.resetButtonHoverColor,
            text_color=constants.fontColor, corner_radius=6, width=28,
            command=lambda: self.ClearSlot()
        )
        self.clearButton.grid(row=0, column=8, padx=(0, 8))

        self.skipReset = True

        def reset_frame_data(*args):
            if self.skipReset:
                self.skipReset = False
                return

            self.frameData = FrameData(
                name='',
                mote='',
                properties=copy.deepcopy(pokemonCatalog.default_props)
            )
            self._refresh_icons()

        self.pokemonNameEntry.trace_add("write", reset_frame_data)

    def openUpdateWindow(self, pokemonName):
        updateWindow = ctk.CTkToplevel(self.frame)
        updateWindow.resizable(False, False)
        updateWindow.configure(fg_color=constants.mainFrameColor)

        _font = ctk.CTkFont(family=constants.fontName, size=constants.smallSize)

        if pokemonName.strip() == "":
            updateWindow.title(constants.errorWindowTitle)
            updateWindow.geometry("300x90")
            ctk.CTkLabel(updateWindow, text=constants.pokemonEmptyProperties,
                         font=_font, text_color=constants.errorColor).pack(pady=30, padx=20)
            return

        updateWindow.title(pokemonName.capitalize() + constants.propertiesSuffix)
        updateWindow.grab_set()

        specific_props = pokemonCatalog.pokemon_properties.get(pokemonName.lower(), {})
        self.prop_vars = {}

        for key, common_list in pokemonCatalog.common_props.items():
            specific_list = specific_props.get(key, [])
            merged_list = common_list + [item for item in specific_list if item not in common_list]

            row = ctk.CTkFrame(updateWindow, fg_color="transparent")
            row.pack(fill="x", padx=12, pady=(8, 0))

            ctk.CTkLabel(row, text=key.capitalize(), font=_font,
                         text_color=constants.fontColor, fg_color="transparent",
                         width=65, anchor="w").pack(side="left")

            merged_list_str = []
            for item in merged_list:
                if isinstance(item, (list, tuple)):
                    merged_list_str.append(str(item[0]) if len(item) > 0 else "")
                else:
                    merged_list_str.append(str(item))

            current_value = str(self.frameData.properties.get(key))
            var = tk.StringVar(value=current_value)
            self.prop_vars[key] = var

            ctk.CTkComboBox(row, variable=var, values=merged_list_str, font=_font,
                            fg_color=constants.entryColor, text_color=constants.fontColor,
                            button_color=constants.buttonsColor, button_hover_color=constants.buttonHoverColor,
                            border_color=constants.edgeColor, dropdown_fg_color=constants.innerFrameColor,
                            dropdown_text_color=constants.fontColor, dropdown_hover_color=constants.buttonHoverColor,
                            width=160).pack(side="left", padx=(6, 0))

        def applyProperties():
            self.frameData.name = pokemonName
            self.frameData.properties = {k: v.get() for k, v in self.prop_vars.items()}
            self._refresh_icons()
            updateWindow.destroy()

        ctk.CTkButton(updateWindow, text="Set", command=applyProperties, font=_font,
                      fg_color=constants.buttonsColor, hover_color=constants.buttonHoverColor,
                      text_color=constants.fontColor, corner_radius=6, width=120
                      ).pack(pady=(12, 12))

        n_rows = len(pokemonCatalog.common_props)
        updateWindow.geometry(f"300x{n_rows * 44 + 80}")

    def ClearSlot(self):
        self.skipReset = True
        self.pokemonNameEntry.set("")
        self.pokemonMoteEntry.set("")
        self.frameData = FrameData(
            name='',
            mote='',
            properties=copy.deepcopy(pokemonCatalog.default_props)
        )
        self._refresh_icons()

    def _refresh_icons(self):
        gender = str(self.frameData.properties.get('gender', 'male'))
        skin   = str(self.frameData.properties.get('skin', 'common'))
        shiny  = str(self.frameData.properties.get('shiny', 'False'))

        if gender == 'female':
            self.genderIcon.configure(text="♀", text_color=constants.accentColor)
        else:
            self.genderIcon.configure(text="♂", text_color="#6699ff")

        self.skinIcon.configure(text_color=constants.accentColor if skin != 'common' else "#555555")
        self.shinyIcon.configure(text_color="#FFD700" if shiny == 'True' else "#555555")

    def Clear(self):
        self.pokemonNameEntry.set("")
        self.pokemonMoteEntry.set("")
        self._refresh_icons()
