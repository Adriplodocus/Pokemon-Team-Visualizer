@echo off
echo Updating pokemon-list.json...
python scripts/generate_pokemon_list.py
if errorlevel 1 (
    echo Failed. Check Python is installed and sprites/ exists.
    exit /b 1
)
echo Done. Commit pokemon-list.json before deploying.
