@echo off
echo ========================================================
echo   Aggiornamento Dati da Excel e Avvio GREEN_ENERBRAS...
echo ========================================================
echo.
echo 1. Verifica e aggiornamento dati da Excel...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0update_data_from_excel.ps1"
echo.
echo 2. Avvio dell'applicazione in corso...
cd /d "%~dp0"
start msedge --allow-file-access-from-files --user-data-dir="%~dp0Edge_Profile" "file:///%~dp0index.html"
