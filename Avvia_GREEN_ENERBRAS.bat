@echo off
echo ========================================================
echo   Avvio di GREEN ENERBRAS ONE in Modalita' Locale...
echo ========================================================
echo.
start msedge --allow-file-access-from-files --user-data-dir="%~dp0\Edge_Profile" "file:///%~dp0index.html"
