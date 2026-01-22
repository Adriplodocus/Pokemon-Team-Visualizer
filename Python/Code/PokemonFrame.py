from Code import Constants as constants
from Code.FrameData import FrameData
from tkinter import Label, Checkbutton, Button, BooleanVar, Entry, CENTER
import tkinter as tk
from tkinter import ttk
import sys
import os
import copy

from Code import PokemonCatalog as pokemonCatalog

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class PokemonFrame:
    def __init__(self, count, root, frame, tk):
        default_properties = copy.deepcopy(pokemonCatalog.default_props)

        self.frameData = FrameData(
            name='',
            mote='',
            properties=default_properties
        )

        self.frame = frame(root, bg=constants.innerFrameColor)
        self.frame.place(relwidth=0.95, height=50, relx=0.5, rely=0.1, y=constants.baseYForFrames * count, anchor="n")

        self.label = Label(self.frame, text="Pokemon " + str(count+1) + ":", font=f"{constants.fontName} {constants.smallSize}", bg=constants.innerFrameColor, fg=constants.fontColor)
        self.moteLabel = Label(self.frame, text="Nickname:", font=f"{constants.fontName} {constants.smallSize}", bg=constants.innerFrameColor, fg=constants.fontColor)

        self.pokemonNameEntry = tk.StringVar()
        self.pokemonMoteEntry = tk.StringVar()
        self.pokemonNameInput = Entry(self.frame, justify=CENTER, font=f"{constants.fontName} {constants.smallSize}",width=constants.entryWidth, textvariable=self.pokemonNameEntry)
        self.pokemonMoteInput = Entry(self.frame, justify=CENTER, font=f"{constants.fontName} {constants.smallSize}", width=constants.entryWidth, textvariable=self.pokemonMoteEntry)
        
        self.label.grid(row=0, column=0, padx=10)
        self.moteLabel.grid(row=0, column=2, padx=10)

        self.pokemonNameInput.grid(row=0, column=1, padx=10)
        self.pokemonMoteInput.grid(row=0, column=3, padx=10)

        self.updateButton = tk.Button(
            self.frame,
            text=constants.pokemonPropertiesText,
            font=f"{constants.fontName} {constants.smallSize}",
            bg=constants.buttonsColor,
            fg=constants.fontColor,
            activebackground=constants.buttonsColor,
            command=lambda: self.openUpdateWindow(
                self.pokemonNameEntry.get()
                )
        )
        self.updateButton.grid(row=0, column=7, padx=10)

        self.skipReset = True

        def reset_frame_data(*args):
            if (self.skipReset):
                self.skipReset = False
                return

            self.frameData = FrameData(
                name='',
                mote='',
                properties = copy.deepcopy(pokemonCatalog.default_props)
            )

        self.pokemonNameEntry.trace_add("write", reset_frame_data)

    def openUpdateWindow(self, pokemonName):
        updateWindow = tk.Toplevel(self.frame)

        if pokemonName.strip() == "":
            updateWindow.title("Error")
            tk.Label(
                updateWindow,
                text="Debes introducir un nombre de Pokémon para ver sus propiedades.",
                font=f"{constants.fontName} {constants.smallSize}",
                fg=constants.errorColor
            ).pack(pady=50)
            return
        else:
            updateWindow.title(f"Propiedades de {pokemonName.capitalize()}")

        specific_props = pokemonCatalog.pokemon_properties.get(pokemonName.lower(), {})
        self.prop_vars = {}

        row_count = 0

        for key, common_list in pokemonCatalog.common_props.items():
            specific_list = specific_props.get(key, [])
            merged_list = common_list + [item for item in specific_list if item not in common_list]

            frame = tk.Frame(updateWindow)
            frame.pack(fill="x", pady=5, padx=10)

            tk.Label(frame, text=key.capitalize(), font=f"{constants.fontName} {constants.smallSize}").grid(row=0, column=0, sticky="w")

            # Normalizamos merged_list a strings simples
            merged_list_str = []
            for item in merged_list:
                if isinstance(item, (list, tuple)):
                    if len(item) > 0:
                        merged_list_str.append(str(item[0]))
                    else:
                        merged_list_str.append("")  # lista vacía
                else:
                    merged_list_str.append(str(item))

            # Tomamos el valor actual: el guardado previamente o el primer valor de la lista
            current_value = self.frameData.properties.get(key)
            
            current_value = str(current_value)

            var = tk.StringVar(value=current_value)

            self.prop_vars[key] = var

            combo = ttk.Combobox(frame, textvariable=var, values=merged_list_str, state="readonly")
            combo.grid(row=0, column=1, sticky="w", padx=5)
            row_count += 1

        def applyProperties():
            result = {}

            for key, var in self.prop_vars.items():
                if isinstance(var, tk.BooleanVar):
                    result[key] = var.get()
                else:
                    result[key] = var.get()

            self.frameData.name = pokemonName
            self.frameData.properties = result

            updateWindow.destroy()

        # Botón para cerrar / aplicar cambios, cuenta como una fila más
        tk.Button(updateWindow, text="Set", command=applyProperties).pack(pady=10)
        row_count += 1

        # Ajustamos el tamaño de la ventana: ancho fijo, alto según filas
        row_height = constants.propertyHeight  # alto aproximado por fila
        window_height = row_count * row_height + 30  # +30 para padding extra
        window_width = 300
        updateWindow.geometry(f"{window_width}x{window_height}")

    def Clear(self):
        self.pokemonNameInput.delete(0, 'end')
        self.pokemonMoteInput.delete(0, 'end')