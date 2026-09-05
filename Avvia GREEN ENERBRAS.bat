@echo off
echo ========================================================
echo   Aggiornamento Dati da Excel e Avvio GREEN ENERBRAS...
echo ========================================================
echo.
echo 1. Verifica e aggiornamento da Controle_GD_TriStarOne.xlsx...
powershell.exe -ExecutionPolicy Bypass -File "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS\update_data_from_excel.ps1"
echo.
echo 2. Avvio dell'applicazione in corso...
cd /d "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS"
start msedge --allow-file-access-from-files --user-data-dir="%~dp0Edge_Profile" "file:///C:/Users/Utilisateur/Desktop/Documents/GitHub/GREEN_ENERBRAS/index.html"
