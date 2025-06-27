from Code import Constants as constants
from tkinter import Label, Entry, CENTER

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

class PokemonFrame:
    def __init__(self, count, root, frame, tk):
        self.frame = frame(root, bg=constants.innerFrameColor)
        self.frame.place(relwidth=0.95, height=50, relx=0.5, rely=0.1, y=constants.baseYForFrames * count, anchor="n")

        self.label = Label(self.frame, text="Pokemon " + str(count+1) + ":", font=f"{constants.fontName} {constants.smallSize}", bg=constants.innerFrameColor, fg=constants.fontColor)
        self.label.grid(row=0, column=0, padx=10, pady=10)

        self.pokemonNameEntry = tk.StringVar()

        self.pokemonNameInput = Entry(self.frame, justify=CENTER, font=f"{constants.fontName} {constants.smallSize}",width=constants.entryWidth, textvariable=self.pokemonNameEntry)
        self.pokemonNameInput.grid(row=0, column=1, padx=10, pady=10)

        self.moteLabel = Label(self.frame, text="Nickname:", font=f"{constants.fontName} {constants.smallSize}", bg=constants.innerFrameColor, fg=constants.fontColor)
        self.moteLabel.grid(row=0, column=2, padx=10, pady=10)

        self.pokemonMoteEntry = tk.StringVar()

        self.pokemonMoteInput = Entry(self.frame, justify=CENTER, font=f"{constants.fontName} {constants.smallSize}", width=constants.entryWidth, textvariable=self.pokemonMoteEntry)
        self.pokemonMoteInput.grid(row=0, column=3, padx=10, pady=10)

    def Clear(self):
        self.pokemonNameInput.delete(0, 'end')
        self.pokemonMoteInput.delete(0, 'end')