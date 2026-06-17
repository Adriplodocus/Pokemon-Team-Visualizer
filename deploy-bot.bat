@echo off
echo Deploying TwitchBot Worker...
cd /d "%~dp0bot-worker"
npx wrangler deploy
if errorlevel 1 (
    echo Worker deploy failed.
    exit /b 1
)
echo Worker deployed.
cd /d "%~dp0"
echo Done.
