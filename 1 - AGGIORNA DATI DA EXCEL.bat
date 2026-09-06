@echo off
echo ========================================================
echo   Aggiornamento Dati da Excel:
echo   - Produzione e Vendite (Controle_GD_TriStarOne.xlsx)
echo   - Conto Bancario (CONTABILITA Green Enerbras One SCSp.xlsx)
echo   - Tassi di Cambio (TRANSFERTS.xlsx)
echo ========================================================
echo.
powershell.exe -ExecutionPolicy Bypass -File "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS\update_data_from_excel.ps1"
echo.
echo Aggiornamento completato! Premi un tasto per uscire.
pause
