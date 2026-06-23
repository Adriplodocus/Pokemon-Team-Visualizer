@echo off
echo Updating pokemon-list.json...
python scripts/generate_pokemon_list.py
if errorlevel 1 (
    echo Failed. Check Python is installed and sprites/ exists.
    exit /b 1
)
echo Updating theme-index.json...
python scripts/generate_theme_index.py
if errorlevel 1 (
    echo Failed to generate theme-index.json.
    exit /b 1
)
echo Done. Commit pokemon-list.json and sprites/theme-index.json before deploying.
pause
