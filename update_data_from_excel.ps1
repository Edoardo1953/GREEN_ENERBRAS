Add-Type -AssemblyName System.IO.Compression.FileSystem

function ToDouble([string]$val) {
    if (!$val) { return 0.0 }
    $clean = $val.Trim().Replace(',', '.')
    $num = 0.0
    if ([double]::TryParse($clean, [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$num)) {
        return $num
    }
    return 0.0
}

function ColToNum([string]$col) {
    $num = 0
    foreach ($char in $col.ToCharArray()) {
        $num = $num * 26 + ([int]$char - [int][char]'A' + 1)
    }
    return $num
}

function NumToCol([int]$num) {
    $col = ""
    while ($num -gt 0) {
        $rem = ($num - 1) % 26
        $col = [char]([int][char]'A' + $rem) + $col
        $num = [Math]::Floor(($num - 1) / 26)
    }
    return $col
}

function Update-GreenEnerbrasData {
    $projectDir = "C:\Users\Utilisateur\Desktop\Documents\GitHub\GREEN_ENERBRAS"
    $searchPaths = @(
        "C:\Users\Utilisateur\Desktop\Controle_GD_TriStarOne.xlsx",
        "C:\Users\Utilisateur\OneDrive\Desktop\Controle_GD_TriStarOne.xlsx",
        (Join-Path $projectDir "Controle_GD_TriStarOne.xlsx")
    )

    $xlsxPath = ""
    foreach ($p in $searchPaths) {
        if (Test-Path $p) {
            $xlsxPath = $p
            break
        }
    }

    if (!$xlsxPath) {
        Write-Error "File Controle_GD_TriStarOne.xlsx non trovato!"
        return
    }

    Write-Host "Trovato file Excel: $xlsxPath"
    $localCopy = Join-Path $projectDir "Controle_GD_TriStarOne.xlsx"
    if ($xlsxPath -ne $localCopy) {
        Copy-Item -Path $xlsxPath -Destination $localCopy -Force
        Write-Host "Copiato in: $localCopy"
    }

    # Open and extract XMLs
    $zip = [System.IO.Compression.ZipFile]::OpenRead($localCopy)
    
    # Shared strings
    $ssEntry = $zip.GetEntry("xl/sharedStrings.xml")
    $sharedStrings = @()
    if ($ssEntry) {
        $reader = New-Object System.IO.StreamReader($ssEntry.Open())
        $ssXml = [xml]$reader.ReadToEnd()
        $reader.Close()
        foreach ($si in $ssXml.sst.si) {
            if ($si.t) { $sharedStrings += $si.t }
            elseif ($si.r) { $sharedStrings += ($si.r | ForEach-Object { $_.t }) -join '' }
            else { $sharedStrings += "" }
        }
    }

    # Find Faturamento sheet
    $wbEntry = $zip.GetEntry("xl/workbook.xml")
    $reader = New-Object System.IO.StreamReader($wbEntry.Open())
    $wbXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    
    $sheetObj = $wbXml.workbook.sheets.sheet | Where-Object { $_.name -like "*Faturamento*" } | Select-Object -First 1
    if (!$sheetObj) {
        $zip.Dispose()
        throw "Foglio 'Faturamento (Nao Editar)' non trovato!"
    }
    $rId = $sheetObj.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    
    $relsEntry = $zip.GetEntry("xl/_rels/workbook.xml.rels")
    $reader = New-Object System.IO.StreamReader($relsEntry.Open())
    $relsXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $rel = $relsXml.Relationships.Relationship | Where-Object { $_.Id -eq $rId }
    $target = $rel.Target
    if ($target.StartsWith("/")) { $target = $target.Substring(1) } else { $target = "xl/" + $target }
    
    $wsEntry = $zip.GetEntry($target)
    $reader = New-Object System.IO.StreamReader($wsEntry.Open())
    $wsXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    $zip.Dispose()

    # Parse rows into dictionary
    $sheetRows = @{}
    foreach ($row in $wsXml.worksheet.sheetData.row) {
        $rNum = [int]$row.r
        $rowDict = @{}
        foreach ($c in $row.c) {
            $colLetter = $c.r -replace '[0-9]', ''
            $val = ""
            if ($c.v) {
                if ($c.t -eq "s") { $val = $sharedStrings[[int]$c.v] }
                else { $val = $c.v }
            }
            $rowDict[$colLetter] = $val
        }
        $sheetRows[$rNum] = $rowDict
    }

    $row5 = $sheetRows[5]
    $row6 = $sheetRows[6]
    
    # 1. Detect price columns
    $priceCosernCol = ""
    $priceDiscountCol = ""
    $maxColNum = 50
    for ($i = 2; $i -le $maxColNum; $i++) {
        $colLet = NumToCol $i
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        if ($val6 -like "*Pre*o*R$*KWh*(-)*" -or $val6 -like "*(-) 30%*") {
            $priceDiscountCol = $colLet
        } elseif ($val6 -like "*Pre*o*R$*KWh*") {
            $priceCosernCol = $colLet
        }
    }
    
    $priceCosernColNum = if ($priceCosernCol) { ColToNum $priceCosernCol } else { 7 }
    
    # 2. Detect Usina columns (from column B until priceCosernCol)
    $usinaCols = @()
    for ($i = 2; $i -lt $priceCosernColNum; $i++) {
        $colLet = NumToCol $i
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        if ($val6 -ne "") {
            $usinaCols += $colLet
        }
    }
    
    # 3. Detect Client columns (starting after priceDiscountCol until TOTAL / empty)
    $startClientColNum = if ($priceDiscountCol) { (ColToNum $priceDiscountCol) + 1 } else { 10 }
    while ($startClientColNum -le $maxColNum) {
        $colLet = NumToCol $startClientColNum
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        if ($val6 -ne "") { break }
        $startClientColNum++
    }
    
    $clientCols = @()
    for ($i = $startClientColNum; $i -le $maxColNum; $i++) {
        $colLet = NumToCol $i
        $val6 = if ($row6.ContainsKey($colLet)) { $row6[$colLet].Trim() } else { "" }
        $val5 = if ($row5.ContainsKey($colLet)) { $row5[$colLet].Trim() } else { "" }
        if ($val6 -like "*TOTAL*") { break }
        if ($val6 -eq "" -and $val5 -eq "") { break }
        if ($val6 -ne "") {
            $clientCols += $colLet
        }
    }

    Write-Host "Usinas rilevate: $($usinaCols.Count) colonne ($($usinaCols -join ', '))"
    Write-Host "Clienti rilevati: $($clientCols.Count) colonne ($($clientCols -join ', '))"

    # 4. Extract data rows
    $newProduction = @()
    $rowKeys = $sheetRows.Keys | Where-Object { $_ -ge 7 } | Sort-Object
    
    foreach ($r in $rowKeys) {
        $rDict = $sheetRows[$r]
        $compVal = if ($rDict.ContainsKey('A')) { $rDict['A'] } else { "" }
        if (!$compVal -or $compVal -eq "0") { continue }
        
        $period = ""
        $numericDate = 0.0
        if ([double]::TryParse($compVal.Replace(',', '.'), [System.Globalization.NumberStyles]::Any, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$numericDate)) {
            if ($numericDate -gt 30000 -and $numericDate -lt 60000) {
                $dt = [DateTime]::FromOADate($numericDate)
                $period = $dt.ToString("MM/yyyy")
            }
        } else {
            $period = $compVal.Trim()
        }
        if (!$period) { continue }

        # Check if row has data
        $hasData = $false
        for ($uIdx = 0; $uIdx -lt $usinaCols.Count; $uIdx++) {
            $uCol = $usinaCols[$uIdx]
            $kwhRaw = if ($rDict.ContainsKey($uCol)) { $rDict[$uCol] } else { "" }
            $kwhVal = ToDouble $kwhRaw
            if ($kwhVal -gt 0) {
                $hasData = $true
                break
            }
        }
        if (!$hasData) { continue }

        for ($uIdx = 0; $uIdx -lt $usinaCols.Count; $uIdx++) {
            $uCol = $usinaCols[$uIdx]
            $usinaId = ($uIdx + 1).ToString()
            $usinaName = $row6[$uCol].Trim()

            $kwhRaw = if ($rDict.ContainsKey($uCol)) { $rDict[$uCol] } else { "0" }
            $kwhVal = ToDouble $kwhRaw

            $cCol = if ($uIdx -lt $clientCols.Count) { $clientCols[$uIdx] } else { "" }
            $clientName = if ($cCol -and $row6.ContainsKey($cCol)) { $row6[$cCol].Trim() } else { $usinaName }

            $revRaw = if ($cCol -and $rDict.ContainsKey($cCol)) { $rDict[$cCol] } else { "0" }
            $revVal = ToDouble $revRaw

            $newProduction += [PSCustomObject]@{
                period = $period
                id = $usinaId
                kwh = [Math]::Round($kwhVal, 2)
                revenues = [Math]::Round($revVal, 2)
                client = $clientName
            }
        }
    }

    Write-Host "Totale record di produzione generati: $($newProduction.Count)"

    # 5. Read and update data.js
    $dataPath = Join-Path $projectDir "data.js"
    $jsContent = Get-Content -Path $dataPath -Raw
    $jsonStr = $jsContent -replace '^const APP_DATA =\s*', '' -replace ';\s*window[\s\S]*$', '' -replace ';\s*$', ''
    $appData = $jsonStr | ConvertFrom-Json

    # Replace production
    $appData.production = $newProduction
    $appData.lastUpdated = (Get-Date).ToString("dd/MM/yyyy HH:mm")

    # Save data.js with unified color helpers
    $updatedJson = $appData | ConvertTo-Json -Depth 10
    $colorHelpers = @"

window.USINA_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#14b8a6', '#6366f1', '#0ea5e9', '#2dd4bf', '#2563eb', '#059669', '#4f46e5', '#0891b2', '#15803d'];
window.CLIENT_COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#d946ef', '#ef4444', '#e11d48', '#a855f7', '#fb923c', '#f43f5e', '#c026d3', '#ea580c'];

window.getUsinaColor = function(id, index) {
    if (typeof index === 'number' && index >= 0) return window.USINA_COLORS[index % window.USINA_COLORS.length];
    const num = parseInt(id, 10);
    if (!isNaN(num) && num > 0) return window.USINA_COLORS[(num - 1) % window.USINA_COLORS.length];
    return window.USINA_COLORS[0];
};

window.getClientColor = function(client, index, allClientsList) {
    if (typeof index === 'number' && index >= 0) return window.CLIENT_COLORS[index % window.CLIENT_COLORS.length];
    if (allClientsList && Array.isArray(allClientsList)) {
        const foundIdx = allClientsList.indexOf(client);
        if (foundIdx >= 0) return window.CLIENT_COLORS[foundIdx % window.CLIENT_COLORS.length];
    }
    return window.CLIENT_COLORS[0];
};

window.getAvailableYears = function() {
    const dataYears = new Set();
    if (typeof APP_DATA !== 'undefined') {
        if (APP_DATA.production) {
            APP_DATA.production.forEach(r => {
                const y = String(r.period).split('/')[1];
                if (y && !isNaN(Number(y))) dataYears.add(Number(y));
            });
        }
        if (APP_DATA.transactions) {
            APP_DATA.transactions.forEach(t => {
                if (t.date) {
                    const parts = t.date.split('/');
                    const y = parts.length === 3 ? parts[2] : (t.date.split('-')[0]);
                    if (y && !isNaN(Number(y))) dataYears.add(Number(y));
                }
            });
        }
    }
    const currYear = new Date().getFullYear();
    const baseYears = [2024, 2025, 2026, 2027, 2028, currYear];
    const allNums = [...baseYears, ...Array.from(dataYears)];
    const min = Math.min(...allNums);
    const max = Math.max(...allNums);
    const result = [];
    for (let yr = max; yr >= min; yr--) {
        result.push(String(yr));
    }
    return result;
};

window.getAvailableMonths = function() {
    const years = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears() : ['2028', '2027', '2026', '2025', '2024'];
    const allMonths = [];
    years.forEach(y => {
        ['12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02', '01'].forEach(m => {
            allMonths.push(m + '/' + y);
        });
    });
    return allMonths;
};
"@
    $newJsContent = "const APP_DATA = " + $updatedJson + ";" + "`r`n" + $colorHelpers
    [System.IO.File]::WriteAllText($dataPath, $newJsContent, [System.Text.Encoding]::UTF8)
    Write-Host "File data.js aggiornato con successo!"
}

Update-GreenEnerbrasData