@echo off
echo ========================================================
echo   Aggiornamento Dati da Excel:
echo   - Impianti e Mappa (Impianti Tri Star.xlsx)
echo   - Produzione e Vendite (Controle_GD_TriStarOne.xlsx)
echo   - Conto Bancario (CONTABILITA Green Enerbras One SCSp.xlsx)
echo   - Tassi di Cambio (TRANSFERTS.xlsx)
echo   - Inflazione COSERN (COSERN_Prezzi_Energia_Definitivo.xlsx)
echo ========================================================
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0update_data_from_excel.ps1"
echo.
echo Aggiornamento completato! Premi un tasto per uscire.
pause
