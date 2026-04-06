@echo off
setlocal

cd /d "%~dp0"

:menu
cls
echo ==============================
echo   Tomis Rebuild Control Menu
echo ==============================
echo.
echo   1. Start
echo   2. Stop
echo   3. Restart
echo   4. Status
echo   5. Build Image
echo   6. Exit
echo.
set /p choice=Choose an operation: 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto build
if "%choice%"=="6" goto end

echo.
echo Invalid choice.
goto finish

:start
echo.
echo Starting Tomis Rebuild on http://localhost:3002 ...
docker compose up -d --build
goto show_status

:stop
echo.
echo Stopping Tomis Rebuild ...
docker compose down
goto show_status

:restart
echo.
echo Restarting Tomis Rebuild ...
docker compose down
docker compose up -d --build
goto show_status

:status
echo.
echo Checking status ...
goto show_status

:build
echo.
echo Building Docker image ...
docker build -t tomis-rebuild .
goto show_status

:show_status
echo.
echo Current Docker status:
docker compose ps
goto finish

:finish
echo.
set /p exitprompt=Press Enter to exit...
goto end

:end
endlocal
